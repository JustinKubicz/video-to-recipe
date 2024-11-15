#include <iostream>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
#include <readline/readline.h>
#include <readline/history.h>
//sudo apt-get install libreadline-dev
using namespace std;
/*
!!!!!!!!TODO!!!!!!!!!
1. .history exists in home now 
(on the laptop, create on pc) verify that the
output from shell history is correctly being appended




*/
int historyCount = 0;
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
        for (int i = 0; args[i] != nullptr; i++)
        {

            execvp(args[0], args);
        }
        exit(1); // if exec fails, exit with code 1
    }
    else
    {
        int status;
        if (-1 == waitpid(aPID, &status, 0))
        {
            perror("waitpid error");
        }
        return status;
    }
}

char **parseInput(char *in)
{
    int s = strlen(in);
    int count = 0;
    char **ans = new char *[s]; // I know 100% of the time, ans will be smaller than s, "cd" is one index of ans and two indecies of in
    int tempIterator = 0;
    char *temp = new char[s];
    for (int i = 0; i < s; i++)
    {

        temp[tempIterator] = in[i];
        tempIterator++;
        if (in[i + 1] == ' ' || i + 1 == s)
        {
            temp[tempIterator] = 0;
            ans[count] = temp;
            count++;
            temp = new char[s];
            tempIterator = 0;
            i += 1;
        }
    }
    ans[count] = nullptr;
    return ans;
}

char **readLineAndAddHistory()
{
    char *input = readline("$");
    char **args = parseInput(input); // as of 11/1, args is correctly an array of char*
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
        perror("chdir");
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
void getAndPrintWorkingDir()
{
    cout << "Donatello:~";
    char *currentDir = get_current_dir_name(); // https://man7.org/linux/man-pages/man3/getcwd.3.html
    cout << currentDir;
}
int startCD(char **args)
{
    //works with "cd .." and "cd.."
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
        return startCD(args);
    }
    else if (0 == strcmp(args[0], "exit"))
    {
        if(append_history(historyCount, NULL) != 0)perror("append_history: ");
        exit(0);
    }
    else
    {
        return Fork(args);
    }
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
        if (i + 1 == size || args[i + 1][0] == '&' && args[i + 1][1] == '&' || args[i + 1] == nullptr)
        {
            int stat = performCommand(working);
            if (stat != 0)
            {
                cout << working[0] << " is not a valid command." << endl;
                break;
            }
        }
    }
}
int main()
{
    if(!(read_history(NULL) == 0)){
        perror("read_history: ");
        exit(1);
    }
    while (true)
    {

        getAndPrintWorkingDir();
        char **args = readLineAndAddHistory(); // as of 11/1, args is correctly an array of char*
        if (isConcatinated(args))
        {
            callPerformCommandsForConcat(args);
        }
        else
        {
            if (0 != performCommand(args))
            {
                cout << args[0] << " is not a recognized command." << endl;
            }
        }
    }
}