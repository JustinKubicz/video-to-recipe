#include <iostream>
#include <sys/mman.h>
#include <sys/stat.h>
#include <string.h>
#include <fcntl.h>  //for fd
#include <unistd.h> //for fd https://www.gnu.org/software/libc/manual/html_node/Opening-and-Closing-Files.html
using namespace std;
int getFileSize(char *name)
{ // https://linux.die.net/man/2/stat
    struct stat bf;
    int stats = stat(name, &bf);
    if (stats == -1)
        throw "STAT() FAILED";
    return bf.st_size;
}
int getSizeOfInputFiles(int numFiles, char *arr[])
{
    int ans = 0;
    for (int i = 1; i < numFiles; i++)
    {
        int stats = getFileSize(arr[i]);
        ans += stats;
    }
    return ans;
}

void openAndCopyInputBytes(int size, char *inputArray[], void *outPutPointer)
{
    int leftOff = 0;
    for (int i = 1; i < size; i++)
    {
        int inputFd = open(inputArray[i], O_RDONLY);
        if (inputFd == -1)
            throw "FAILED TO OPEN INPUT FILE";
        int sizeOfFile = getFileSize(inputArray[i]);
        void *inputPointer = mmap(NULL, sizeOfFile, PROT_READ, MAP_SHARED, inputFd, 0);
        if (inputPointer == (void *)-1)
            throw "MMAP FAILED";
        if (madvise(inputPointer, sizeOfFile, MADV_SEQUENTIAL) == -1)
            throw "MADVISE FAILED";
        void *copyPtr = memcpy(((char *)outPutPointer) + leftOff, inputPointer, sizeOfFile);
        if (copyPtr == (void *)-1)
            throw "MEMCPY() FAILED";
        leftOff += sizeOfFile;
        munmap(inputPointer, sizeOfFile);
        inputFd = close(inputFd);
    }
}
int main(int argc, char *argv[])
{
    try
    {
        int inSize = getSizeOfInputFiles(argc - 1, argv);
        int outFD = open(argv[argc - 1], O_RDWR | O_CREAT | O_EXCL); // open in R and W permissions, Create only if doesn't exist, otherwise error, size is the size of all inputs CHANGE BACK TO ARGV[ARGC - 1] after debug
        ftruncate(outFD, inSize);
        if (outFD == -1)
            throw "FAILED TO OPEN OUTPUT FILE";

        void *outPtr = mmap(NULL, inSize, PROT_WRITE, MAP_SHARED, outFD, 0);
        if (chmod(argv[argc - 1], S_IWUSR | S_IRUSR) == -1)
            throw "FAILED TO SET PERMISSIONS ON OUTPUT FILE";
        if (outPtr == (void *)-1)
            throw "MMAP FAIL";
        if (madvise(outPtr, inSize, MADV_SEQUENTIAL) == -1)
            throw "MADVISE FAILED";
        openAndCopyInputBytes(argc - 1, argv, outPtr);

        munmap(outPtr, inSize);
        outFD = close(outFD);
    }
    catch (char const *e)
    {
        cout << "ERROR ";
        perror(e);
        exit(1);
    }
}
