package myThread;

import java.util.concurrent.ThreadLocalRandom;

public class MyThread extends Thread {

    private double pi;
    private int hits = 0;
    private int attempts = 0;
    private int darts = 0;

    public MyThread(int numberOfDarts) {
        darts = numberOfDarts;
    }

    @Override

    public void run() {
        //runs takes the number of darts that will be allocated to each thread
        for (int i = 0; i <= darts; i++) {
            double x = ThreadLocalRandom.current().nextDouble(0, 1);
            double y = ThreadLocalRandom.current().nextDouble(0, 1);
            double addedSquare = ((y-.5)*(y-.5) + (x - .5)*(x-.5));
            if (Math.sqrt(addedSquare) <= .5) {
                //if distance is less than or equal to .5
                hits++;
            }
            attempts++;
        }
        //area of circle = Pi(.5^2) = Pi/4, so multiplying by 4 yields pi
        pi = ((double)hits / attempts) * 4.0;
    }
    public double getPi(){
        return pi;
    }
}
