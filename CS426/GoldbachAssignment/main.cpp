#include <iostream>
#include <thread>
#include <mutex>
#include <time.h>
#include <math.h>

using namespace std;
mutex mtx;
int numToGrabNext = 2;
int minimum = 0;

bool isPrime(int n)
{
    if (n % 2 == 0)
    {
        return false;
    }
    for (int factor = 3; factor <= sqrt(n); factor += 2)
    {
        if (n % factor == 0)
            return false;
    }
    return true;
}
void goldBach(int seconds)
{
    time_t start = time(0); // got this use of time_t to act as a timer from: https://stackoverflow.com/questions/3913074/calling-a-function-for-a-period-of-time
    time_t now = time(0);

    while ((now - start) <= seconds)
    {
        now = time(0);
        mtx.lock();
        int localNext = numToGrabNext;
        mtx.unlock();
        if (localNext == 2)
        {
            mtx.lock();
            numToGrabNext += 2;
            cout << "2 1 1\n";
            mtx.unlock();
        }
        else if (localNext == 4)
        {
            mtx.lock();
            numToGrabNext += 2;
            cout << "4 1 3\n";
            mtx.unlock();
        }
        for (int prime1 = 3; prime1 <= localNext / 2; prime1 += 2)
        {
            int prime2 = localNext - prime1;
            if (isPrime(prime1) && isPrime(prime2))
            {
                mtx.lock();
                if (prime1 > minimum)
                {
                    minimum = prime1;

                    cout << localNext << " ";
                    cout << minimum << " ";
                    cout << prime2 << "\n";
                }
                /*int temp = prime1;
                if ((temp += 2) > localNext/2)
                {
                
                    numToGrabNext += 2;
                    mtx.unlock();
                    break;
                }*/
                mtx.unlock();
            }
        }
        mtx.lock();
        numToGrabNext += 2;
        mtx.unlock();
    }
}

int main()
{

    cout << "How many threads?: ";
    int threads;
    cin >> threads;
    cout << endl;
    cout << "For how many seconds?: ";
    int seconds;
    cin >> seconds;
    cout << "\n";
    thread *ar = new thread[threads];
    for (int i = 0; i < threads; i++)
    {
        ar[i] = thread(goldBach, seconds);
    }
    for (int i = 0; i < threads; i++)
    {
        ar[i].join();
    }
    ar = nullptr;
}