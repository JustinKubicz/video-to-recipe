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
        // char *ar[] = {"a.txt", "b.txt", "c.txt", "out.txt"};
        int inSize = getSizeOfInputFiles(argc - 1, argv); // change back to argc and argv after debug
        // is output name going to be the last arg?
        int outFD = open(argv[argc - 1], O_RDWR | O_CREAT | O_EXCL); // open in R and W permissions, Create only if doesn't exist, otherwise error, size is the size of all inputs CHANGE BACK TO ARGV[ARGC - 1] after debug
        ftruncate(outFD, inSize);
        if (outFD == -1)
            throw "FAILED TO OPEN OUTPUT FILE";
        if (chmod(argv[argc - 1], S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH) == -1)//when I run this on my laptop, without this line, none of the gibberish shows up, when I run it with this line, gibberish shows up
            throw "CHMOD FAILED"; //needed to set permissions for reading the file, it was for some reason creating without read permissions on my pc at home, got that chmod line from chat gpt
        void *outPtr = mmap(NULL, inSize, PROT_WRITE, MAP_SHARED, outFD, 0);
        if (outPtr == (void *)-1)
            throw "MMAP FAIL";
        openAndCopyInputBytes(argc - 1, argv, outPtr); // change first arg back to argc once working
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
