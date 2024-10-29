#include <iostream>
#include <sys/types.h>
#include <dirent.h>
#include <sys/stat.h>
#include <string.h>
#include <vector>
#include <unistd.h>
#include <fcntl.h>
#include <assert.h>
/*
    opendir() readlink() readdir() closedir()
    Dir, File or link
    returns pointer to dir stream

    TODO:
        test 3 terminates before final expected output: ./test3 (d)

*/
unsigned long visited[1000];
using namespace std;
bool searchAr(auto ar[], auto ino)
{
    for (int i = 0; i < sizeof(ar); i++)
    {
        if (ar[i] == ino)
            return true;
    }
    return false;
}
void doDir(DIR *dir, char *path)
{

    if (dir == nullptr)
    {
        perror("tempDir fail");
        exit(1);
    }
    while (auto *de = readdir(dir))
    {
        char *tempStr = new char[2048]; // made a copy of path parameter because I would lose the starting path every iteration with all the string concatination
        strcpy(tempStr, path);
        struct stat statbuf;
        char *fullPath = strcat(tempStr, "/");
        fullPath = strcat(fullPath, de->d_name);
        // full path stuff might need to move to the end of this while. I believe everything will process as a directory with the way it's currently configured
        for (int i = 0; i < strlen(fullPath); i++)
        {
            cout << fullPath[i];
        }
        lstat(fullPath, &statbuf);
        unsigned long ino = statbuf.st_ino;
        // if (!searchAr(visited, ino))
        // {
        for (int i = 0; i < sizeof(visited); i++)
        {
            if (visited[i] == 0)
            {
                visited[i] = ino;
                break;
            }
        }
        mode_t m = statbuf.st_mode;

        string typeStr = "";
        if (S_ISDIR(m))
        {
            typeStr = "(d)";
            char *name = de->d_name;
            if (!(name[0] == '.' || (name[0] == '.' && name[1] == '.')))
            { // Skip "." and ".." directories
                DIR *subDir = opendir(fullPath);
                cout << " " << typeStr << endl;
                doDir(subDir, fullPath);
                continue; // wo Continue here, it prints an extra blank line, need to break the iteration here
            }
            else
            {
                cout << " " << typeStr;
            }
        }
        else if (S_ISREG(m))
        {
            int size = statbuf.st_size;
            typeStr = "(f, " + to_string(size) + ")";
            cout << " " << typeStr;
        }
        else if (S_ISLNK(m) /*|| !(S_ISREG(m) && S_ISDIR(m))*/)
        /*S_ISLNK flag wasn't triggering on the first link, googling uncovered that stat() returns information
        about the file the link points too, not the link itself, so S_ISLNK wouldn't be raised. So, for now, if not
        reg or dir, you're lnk.
        */
        {
            typeStr = "(l, -> ";
            cout << " " << typeStr;
            // lstat(fullPath, &statbuf);
            char *bf = new char[statbuf.st_size];
            int read = readlink(fullPath, bf, statbuf.st_size);
            assert(read > 0);

            for (int i = 0; i < statbuf.st_size; i++)
            {
                cout << bf[i];
            }
            cout << ")";
        }
        // }
        cout << endl;
        delete tempStr;
    }

    closedir(dir);
}

int main(int argc, char *argv[])
{
    // cout << "argv[1] == " << argv[1]; // DEBUG
    // DIR *d = opendir(argv[1]);
    char start[] = "/home/rappleto/pub/Classes/CS426/Assignments/dircount-assignment/test3";
    DIR *d = opendir(start);
    if (d == nullptr)
    {
        perror("opendir");
        exit(1);
    }
    doDir(d, start);
}