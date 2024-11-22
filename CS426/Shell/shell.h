#ifndef shell
#define shell .h

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
using namespace std;

bool isConcatinated(char **args);
int Exec(int aPID, char **args);
char **parseInput(char *in);
char **readLineAndAddHistory();
int changeDir(char *path);
int Fork(char **args);
void getWorkingDirSetToPS1();
int startCD(char **args);
int performCommand(char **args);
int performFileCommands(char *aFileName);
void callPerformCommandsForConcat(char **args);
int main();

#endif