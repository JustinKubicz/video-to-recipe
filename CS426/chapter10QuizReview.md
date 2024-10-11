1. If computer is thrashing badly, install more RAM or reduce parallelism
2. The most page faults an instruction could reasonably generate under normal use on a normal computer: MORE THAN ONE
3. Threads share global variables, anyting New, open files, sockets, mmap. Do not share, local, and stack
4. Belady's min is impossible. But the best way to avoid page faults, is to look into the future and discard the most distant call of cached stuff
5. Worst case for LRU is repeated sequential access
6. Page tables are stored in RAM
7. Generating any access to a page sets the referenced bit, dirty bit gets set on write
8. stack is usually marked read-write, this is to allow for manipulating of variables
9. Write out seconds unit conversion chart
10. Effective Access Time = Ram Access * Speed of Ram + HardDisk Access * Speed of Disk. Speeds need to be in the same unit
11. mmap returns a pointer to the mapped region 
12. a process cannot write to the ram holding it's page table
13. executable code normally marked read-only, this will prevent other users possibly modifying the code we're running
14. it was written to and hasn't been reset