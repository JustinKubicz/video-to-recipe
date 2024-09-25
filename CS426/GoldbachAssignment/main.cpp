#include <iostream>
#include <thread>
#include <mutex>
#include <time.h>
#include <math.h>

using namespace std;
mutex mtx;
int numToGrabNext = 6;
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
void goldBach(double seconds)
{
    time_t start = time(0); // got this use of time_t to act as a timer from: https://stackoverflow.com/questions/3913074/calling-a-function-for-a-period-of-time
    time_t now = time(0);

    while ((now - start) <= seconds)
    {
        now = time(0);
        mtx.lock();
        int localNext = numToGrabNext;
        mtx.unlock();

        for (int prime1 = 3; prime1 <= localNext / 2; prime1 += 2)
        { // weird stuff happening after 30, when 7 is tried again, we're restarting
            now = time(0);
            if ((now - start) >= seconds)
            {
                break;
            }
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
    double seconds;
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