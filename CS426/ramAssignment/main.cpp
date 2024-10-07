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
    for (int i = 0; i < numFiles; i++)
    {
        int stats = getFileSize(arr[i]);
        ans += stats;
        int debugingTemp = stats;
        cout << "size of " << arr[i] << " file: " << debugingTemp << " bytes" << endl;
    }
    return ans;
}

void openAndCopyInputBytes(int size, char *inputArray[], void *outPutPointer)
{
    int leftOff = 0;
    for (int i = 0; i < size; i++)
    {
        int inputFd = open(inputArray[i], O_RDONLY);
        if (inputFd == -1)
            throw "FAILED TO OPEN INPUT FILE";
        int sizeOfFile = getFileSize(inputArray[i]);
        void *inputPointer = mmap(NULL, sizeOfFile, PROT_READ, MAP_SHARED, inputFd, 0);
        void *copyPtr = memcpy(((char *)outPutPointer) + leftOff, inputPointer, sizeOfFile);
        if(copyPtr == (void *)-1) throw "MEMCPY() FAILED";
        leftOff += sizeOfFile;
        munmap(inputPointer, sizeOfFile);
        inputFd = close(inputFd);
    }

}
int main(int argc, char *argv[])
{
    try
    {
        int inSize = getSizeOfInputFiles(argc, argv);
        //is output name going to be the last arg?                         
        int outFD = open("output.txt", O_RDWR | O_CREAT | O_EXCL); // open in R and W permissions, Create only if doesn't exist, otherwise error, size is the size of all inputs
        ftruncate(outFD, inSize);
        if (outFD == -1)
            throw "FAILED TO OPEN OUTPUT.TXT";
        void *outPtr = mmap(NULL, inSize, PROT_WRITE, MAP_SHARED, outFD, 0);
        if (outPtr == (void *)-1)
            throw "MMAP FAIL";
        openAndCopyInputBytes(argc, argv, outPtr);//change first arg back to argc once working
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
