#include <iostream>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
#include <readline/readline.h>
#include <readline/history.h>
#include <wordexp.h>
#include <fcntl.h>
#include <sstream>
#include "shell.h"
#include <vector>
using namespace std;
/*
!!!!!!!! POINTS I CLAIM !!!!!!!!!
    3 You search the path for the executable
        ls
    2 Can run commands in the background.
        processImage &
    2 Concatenate commands with &&.  Only runs next command if the previous command returned success.
        cd /home/rappleto && rm fred.txt
    3 Does filename expansion "glob"
        (Hint:  Use the built in glob, or really use wordexp.)
        http://www.gnu.org/software/libc/manual/html_node/Wordexp-Example.html
        http://euclid.nmu.edu/~rappleto/Classes/CS426/Assignments/TheBigAssignment/wordexp-example.cc
        ls a*b
    1 Replace "~" with the home directory
        (wordexp can do this too)
        rm ~/junkfile
    1 Control-L clears the screen
    1 Tab Completion
    1 Arrow History
    1 Saves and reloads history to a file
    1 Knows how to change directory
        (See chdir)
        cd /fred
    2 Can run commands from a file
        . scriptFile.txt
    2 Automatically runs a file called .myshell when it starts
    1 Bang last command that starts with some letter.
        Assuming in the past you ran 'rm'.
            !r runs rm
    1 Bang # command
            !4 runs 4th command from history
    +2 Turned in 4 days early (Monday)
    24 points
*/

int historyCount = 0;
int backgroundProcessFlag = false;
bool isConcatinated(char **args)
{
    int size = 0;
    for (int i = 0; i < 10000000; i++)
    {
        if (args[i] != nullptr)
            size++;
        if (args[i] == nullptr)
            break;
    }
    for (int i = 0; i < size; i++)
    {
        if (args[i][0] == '&' && args[i][1] == '&')
        {
            return true;
        }
    }
    return false;
}
int Exec(int aPID, char **args)
{

    if (aPID == 0)
    {
        // for (int i = 0; args[i] != nullptr; i++)
        ///{

        if (-1 == execvp(args[0], args))
        {
            perror("execvp: ");
            exit(1);
        }
        // }
    }
    else if (!backgroundProcessFlag)
    {
        int status;
        if (-1 == waitpid(aPID, &status, 0))
        {
            perror("waitpid error");
        }
        return status;
    }
    else
    {
        return 0;
    }
}
char **parseInput(char *in)
{
    wordexp_t result;
    int s = strlen(in);
    int count = 0;

    int tempIterator = 0;
    char *temp = new char[s];
    vector<int> concatIndecies;
    int numberOfDoubleAmps = 0;
    for (int i = 0; i < s; i++)
    {

        temp[tempIterator] = in[i];
        tempIterator++;

        if (in[i + 1] == ' ' || i + 1 == s)
        {
            temp[tempIterator] = 0;
            if (0 == strcmp(temp, "&"))
            {
                backgroundProcessFlag = !backgroundProcessFlag;
                break;
            }
            else if (0 == strcmp(temp, "&&"))
            {
                temp = new char[s];
                tempIterator = 0;
                i += 1;
                concatIndecies.push_back(count + numberOfDoubleAmps);
                numberOfDoubleAmps++;
                continue;
            }
            int wordy = 0;
            if (count == 0)
                wordy = wordexp(temp, &result, 0);
            if (count > 0)
                wordy = wordexp(temp, &result, WRDE_APPEND | WRDE_SHOWERR);
            if (wordy != 0)
            {
                perror("wordexp() fail: ");
            }

            count++;
            temp = new char[s];
            tempIterator = 0;
            i += 1;
        }
    }
    char **temp2 = result.we_wordv;
    char **answer = new char *[result.we_wordc + concatIndecies.size()];
    int startForA = 0;
    if (!concatIndecies.empty())
    {
        int nextIndecie = 0;
        int lastIndexOfAnswer = 0;
        for (int i = 0; i < count; i++)
        {

            for (int a = startForA; a < result.we_wordc + concatIndecies.size(); a++)
            {
                answer[a] = temp2[i];
                cout << "answer[" << a << "] == temp2[" << i << "] == " << answer[a] << endl;
                if (a + 1 == concatIndecies[nextIndecie])
                {
                    string amps = "&&";
                    char *am = new char[2];
                    strcpy(am, amps.c_str());
                    answer[a + 1] = am;
                    cout << "asnwer[" << a + 1 << "] == && " << endl;
                    startForA = a + 2;
                    nextIndecie++;
                    break;
                }
                lastIndexOfAnswer = a + 1;
                i++;
            }
        }
        answer[lastIndexOfAnswer] = nullptr;
        return answer;
    }
    return temp2;
}

char **readLineAndAddHistory()
{
    char **args;
    char *PS1 = getenv("PS1");
    char *input = readline(getenv("PS1"));
    fflush(stdout);
    if (strcmp(input, "") == 0)
    {
        cout << "Please Enter A Command." << endl;
        free(input);
        return nullptr;
    }
    else
    {
        args = parseInput(input); // as of 11/1, args is correctly an array of char*
    }
    add_history(input);
    historyCount++;
    free(input);
    return args;
}
int changeDir(char *path)
{
    int newDir = chdir(path);
    if (newDir == -1)
    {
        perror(path);
        return newDir;
    }
    else
        return 0;
}
int Fork(char **args)
{
    int pid = fork();
    if (pid == -1)
        perror("bad fork");
    return Exec(pid, args);
}

void getWorkingDirSetToPS1()
{
    char *tempCurrentDir = get_current_dir_name(); // https://man7.org/linux/man-pages/man3/getcwd.3.html
    if (tempCurrentDir == nullptr)
    {
        perror("get_current_dir_name");
        return;
    }
    std::string curDir(tempCurrentDir + 5);
    std::string prompt = "Donatello:~" + curDir + " $";
    std::string envPrompt = "PS1=" + prompt;
    char *envVar = new char[envPrompt.length() + 1];
    strcpy(envVar, envPrompt.c_str());
    if (putenv(envVar) != 0)
    {
        perror("putenv: ");
    }
    free(tempCurrentDir);
}

int startCD(char **args)
{
    // works with "cd .." and "cd.."
    char *command = args[0];
    if (strlen(command) == 2)
    {
        return changeDir(args[1]);
    }
    else
    {
        int size = strlen(command) - 2;
        char *newDir = new char[size + 1];
        int incrementor = 0;
        for (int i = 2; i < strlen(command); i++)
        {
            newDir[incrementor] = command[i];
            incrementor++;
        }
        newDir[incrementor] = 0;
        return changeDir(newDir);
    }
}

int performCommand(char **args)
{
    if (0 == strcmp(args[0], "cd") || (args[0][0] == 'c' && args[0][1] == 'd'))
    {
        if (!args[1] && (args[0][2] != '.' && args[0][3] != '.'))
            return -1;
        return startCD(args);
    }
    else if (0 == strcmp(args[0], "exit"))
    {
        if (append_history(historyCount, NULL) != 0)
            perror("append_history: ");
        exit(0);
    }
    else if (0 == strcmp(args[0], "."))
    {
        if (0 != performFileCommands(args[1]))
        {
            perror("performFileCommands: ");
        }
    }
    else if (args[0][0] == '!')
    {
        if (isalpha(args[0][1]))
        {
            char *letter = &args[0][1];
            int hisIndex = history_search_prefix(letter, -1);
            if (0 == hisIndex)
            {
                HIST_ENTRY *entry = current_history();
                char **newArgs = parseInput(entry->line);
                performCommand(newArgs);
            }
        }
        else if (isdigit(args[0][1]))
        {
            int num = args[0][1] - '0';
            HIST_ENTRY *entry = history_get(num);
            char **newArgs = parseInput(entry->line);
            performCommand(newArgs);
        }
    }
    else
    {
        return Fork(args);
    }
}
int performFileCommands(char *aFileName)
{
    int fd = open(aFileName, O_RDONLY);
    char bf[1024];
    string toString;
    int hasRead;
    while (
        (hasRead = read(fd, bf, 1024)) > 0)
    {
        toString.append(bf, hasRead);
    }
    stringstream stream(toString);
    string line;
    while (getline(stream, line))
    {
        char *command = new char[line.length()];
        strcpy(command, line.c_str());
        char **newCommand = parseInput(command);
        if (isConcatinated(newCommand))
        {
            callPerformCommandsForConcat(newCommand);
        }
        else
        {
            performCommand(newCommand);
        }
    }
    close(fd);
}
void callPerformCommandsForConcat(char **args)
{
    int size = 0;
    for (int i = 0; i < 10000; i++)
    {
        if (args[i] != nullptr)
            size++;
        if (args[i] == nullptr)
            break;
    }
    char **working = new char *[size];
    for (int i = 0; i < size; i++)
    {
        working[0] = args[i];
        working[1] = nullptr;
        if ((i + 1 == size || args[i + 1] == nullptr || args[i + 1][0] == '&' && args[i + 1][1] == '&') && !(0 == strcmp(working[0], "cd..")))
        {
            int stat = performCommand(working);
            if (stat != 0)
            {
                cout << working[0] << " is not a valid command." << endl;
                break;
            }
        }
        else if (0 == strcmp("cd", working[0]))
        {
            char **cd = new char *[2];
            cd[0] = working[0];
            cd[1] = args[i + 1];
            i += 1;
            if (0 != startCD(cd))
            {
                perror("startCD: ");
            }
        }
        else if (0 == strcmp("cd..", working[0]))
        {
            if (0 != startCD(working))
            {
                perror("startCD: ");
            }
        }
    }
}
int main()
{
    string myshell = ".myshell";
    char *MyShell = new char[myshell.size()];
    strcpy(MyShell, myshell.c_str());
    performFileCommands(MyShell);
    if (!(read_history(NULL) == 0))
    {
        perror("read_history: ");
        exit(1);
    }
    while (true)
    {
        backgroundProcessFlag = false;
        getWorkingDirSetToPS1();
        char **args = readLineAndAddHistory(); // as of 11/1, args is correctly an array of char*
        fflush(stdout);                        // added an fflush to here and to readLineAndAddHistory() b/c I was getting some weird printing going on and google said this could help
        if (args == nullptr)
        {
            continue;
        }
        if (isConcatinated(args))
        {
            callPerformCommandsForConcat(args);
        }
        else
        {
            if (0 != performCommand(args))
            {
                if (0 == strcmp("cd", args[0]))
                {
                    cout << "please specifiy a destination directory for CD." << endl;
                }
                else
                {
                    cout << args[0] << " is not a recognized command." << endl;
                }
            }
        }
    }
}