# Project architecture

This is intended to be more in depth, but right now it's just a collection of notes that might be needed in the future

## Seed

The program accepts a single fixed seed for reproducible results

- A user given seed is used to generate a seed for every election (election seed)
- In an election, use the election seed to generate two seeds (x seed and y seed)
- The x seed is used to seed a random number generator for the x coordinate of the voters. Same for the y seed
- Every voter point depends on the x and y seeds
- The x and y seeds depends on the election seed
- The election seed depends on the user seed

This chart shows a run with 2 elections and 2 voters. The number of children of the User seed node is the number of elections. The number of children of the x and y seed nodes is the number of voters.

```mermaid
flowchart TD;
    A[User seed] --> B[Election 1 seed];
    A[User seed] --> C[Election 2 seed];

    B[Election 1 seed] --> D[x seed];
    B[Election 1 seed] --> E[y seed];
    C[Election 2 seed] --> F[y seed];
    C[Election 2 seed] --> G[y seed];

    D[x seed] --> H[voter 1, x coord];
    D[x seed] --> I[voter 2, x coord];
    E[y seed] --> J[voter 1, y coord];
    E[y seed] --> K[voter 2, y coord];
    F[x seed] --> L[voter 1, x coord];
    F[x seed] --> M[voter 2, x coord];
    G[y seed] --> N[voter 1, y coord];
    G[y seed] --> O[voter 2, y coord];
```
