#include <iostream>
#include <unistd.h>
#include <wordexp.h>

using namespace std;

int main()
{
	string pattern1, pattern2;
	cout << "What file pattern are you looking for\n";
	getline(cin, pattern1);

	cout << "Another file pattern are you looking for\n";
	getline(cin, pattern2);
	
	cout << "The files for " << pattern1 << " and " << pattern2 << " are:\n";
	
	wordexp_t results;
        char *args[1000];
        int count =  0;
        int i; 
        
        wordexp(pattern1.c_str(), &results, 0);
        wordexp(pattern2.c_str(), &results, WRDE_APPEND);

        for (i = 0; i < results.we_wordc; i++)
            cout << "results.we_wordv[" << i << "] = " << results.we_wordv[i] << endl;
        cout << "results.we_wordv[" << i+1 << "] = NULL\n";
        wordfree(&results);
        exit(EXIT_SUCCESS);


}