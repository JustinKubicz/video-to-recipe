#include <iostream>
#include <thread>
#include <mutex>
#include <time.h>
#include <math.h>

using namespace std;
mutex mtx;
int numToGrabNext = 4;
int minimum = 0;
/*def isPrime(n):
    if n % 2 == 0:
        return False
    for factor in range(3, int(sqrt(n))+1, 2):
        if n % factor == 0:
            return False
    return True

    for candidate in range(start, end, 2):
    for prime1 in range(3, candidate//2+1, 2):
        prime2 = candidate - prime1
        print("Testing ", prime1, " ", prime2)
        if isPrime(prime1) and isPrime(prime2):
            if prime1 > max:
                max = prime1
                print(candidate, prime1, prime2)
            break*/
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
    int max = 0;
    while ((now - start) <= seconds)
    {
        now = time(0);
        for (int prime1 = 3; prime1 <= numToGrabNext / 2; prime1 += 2)
        {
            int prime2 = numToGrabNext - prime1;
            cout << "testing " << prime1 << " and " << prime2 << endl;
            if (isPrime(prime1) && isPrime(prime2))
            {
                mtx.lock();
                if (prime1 > minimum)
                {
                    minimum = prime1;
    
                    cout << numToGrabNext + " ";
                    cout << minimum + " ";
                    cout << prime2 + "\n";

                }
                mtx.unlock();
                break;
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