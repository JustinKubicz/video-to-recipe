#include <iostream>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>  //for fd
#include <unistd.h> //for fd https://www.gnu.org/software/libc/manual/html_node/Opening-and-Closing-Files.html
using namespace std;
int getSizeOfInputFiles(int numFiles, char *arr[])
{
    int ans = 0;
    for (int i = 0; i < numFiles; i++)
    { // https://linux.die.net/man/2/stat
        struct stat *bf;
        stat(arr[i], bf);
        ans += bf->st_size;
    }
    return ans;
}
int main(int argc, char *argv[])
{
    try
    {
        // end debugging line
        int inSize = getSizeOfInputFiles(argc, argv);                      // change this back to argv
        int outFD = open("output.txt", O_RDWR | O_CREAT | O_EXCL, inSize); // open in R and W permissions, Create only if doesn't exist otherwise error,
        void *outPtr = mmap(NULL, inSize, PROT_WRITE, MAP_SHARED, outFD, 0);
    }
    catch (char *e)
    {
        perror(e);
    }
}
