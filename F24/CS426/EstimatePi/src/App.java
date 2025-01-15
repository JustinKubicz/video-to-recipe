
import java.util.Scanner;
import myThread.MyThread;

public class App {

    public static void main(String[] args) throws Exception {
        long timeA = 0;
        double pi = 0.0;
        try {//had to google the scanner class because I didn't remeber how to get user input
            Scanner in = new Scanner(System.in);
            System.out.println("how many threads?");
            int numThreads = in.nextInt();
            MyThread arr[] = new MyThread[numThreads];
            System.out.print("how many darts? ");
            int numberOfDarts = in.nextInt();
            in.close();
            int numberOfDartsForEachThread = numberOfDarts / numThreads;
            timeA = System.currentTimeMillis();
            pi = startThreadsAndCalculatePi(arr, numThreads, numberOfDartsForEachThread);
        } catch (Exception e) {
            System.out.print("IO Error: " + e.getMessage());
            System.exit(1);
        }
        long timeB = System.currentTimeMillis();
        double time = ((double) timeB - timeA) / 1000.0;
        System.out.println("pi = " + pi);
        System.out.println("completed in: " + time + " seconds");
    }

    static double startThreadsAndCalculatePi(MyThread ar[], int numberOfThreads, int numDartsPerThread) {
        double ans = 0.0;
        for (int a = 0; a < numberOfThreads; a++) {
            ar[a] = new MyThread(numDartsPerThread);
            ar[a].start();
        }
        for (int b = 0; b < numberOfThreads; b++) {
            try {
                ar[b].join();
            } catch (InterruptedException e) {
                System.out.println("exception caught: " + e.getMessage());
            }
            ans += ar[b].getPi();
        }
        ans /= numberOfThreads;
        return ans;
    }
}
