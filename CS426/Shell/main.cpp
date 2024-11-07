#include <iostream>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
using namespace std;
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
void Exec(int aPID, char **args)
{

    if (aPID == 0)
    {
        /*
        for each thing in path
                execvp(argv[0], argv);
            exit
        */
        for (int i = 0; args[i] != nullptr; i++)
        {

            execvp(args[0], args);
        }
        exit(0);
    }
    else if (aPID > 0)
    {
        int status;
        if (-1 == waitpid(aPID, &status, 0))
        {
            perror("waitpid error");
        }
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

char **startNewOp()
{
    char *input = new char[10000];
    cin.getline(input, 10000);
    char **args = parseInput(input); // as of 11/1, args is correctly an array of char*
    return args;
}
void changeDir(char *path)
{
    int newDir = chdir(path);
    if (newDir == -1)
        perror("chdir");
}
void Fork(char **args)
{
    int pid = fork();
    if (pid == -1)
        perror("bad fork");
    Exec(pid, args);
}
void getAndPrintWorkingDir()
{
    cout << "Donatello:~";
    char *currentDir = get_current_dir_name(); // https://man7.org/linux/man-pages/man3/getcwd.3.html
    cout << currentDir << "$ ";
}
void startCD(char **args)
{
    char *command = args[0];
    if (!command[2])
    {
        changeDir(args[1]);
    }
    else
    {
        char *noSpaceCharAfterCDCommand = new char[strlen(command) - 2];
        int incrementor = 0;
        for (int i = 2; i < strlen(command); i++)
        {
            noSpaceCharAfterCDCommand[incrementor] = command[i];
            incrementor++;
        }
        changeDir(noSpaceCharAfterCDCommand);
    }
}
void readCommand(char **args)
{
    if (0 == strcmp(args[0], "cd"))
    {
        startCD(args);
    }
    else if (0 == strcmp(args[0], "exit"))
    {
        exit(0);
    }
    else
    {
        Fork(args);
    }
}
void callReadCommandsForConcat(char **args)
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
    for(int i = 0; i < size; i++){
        working[0] = args[i];
        working[1] = nullptr;
        if(i+1 == size || args[i+1][0] == '&' && args[i+1][1] == '&' || args[i+1] == nullptr){
            readCommand(working);
        }
        
    }
}
int main()
{

    while (true)
    {

        getAndPrintWorkingDir();
        char **args = startNewOp(); // as of 11/1, args is correctly an array of char*
        if (isConcatinated(args))
        {
            callReadCommandsForConcat(args);
        }
        else
        {
            readCommand(args);
        }
    }
}