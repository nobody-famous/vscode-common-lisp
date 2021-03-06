# Protocol Description

It's a basic text based protocol that sends Lisp expressions back and forth.

## Messages

Each message is a string consisting of 6 hex digits followed by Lisp text.

The digits give the total length of the Lisp text.

```
000005(cmd)
```

## Request

### Package Name

The package name to use for a request needs to be sent with the request. This means that the client side needs to keep track of which package is currently being used, the server doesn't do it.

```
(in-package :some-package)
```
has no effect. The connection still reports being in the top level package.

The Emacs version figures out the package by searching for an in-package call in the current buffer.

## Response

Each response is a list consisting of a response type followed by the data for the response.

### Response Types

#### :return

```
(:return <plist> <msg id?>)
```
If the message ID is present, it specifies which request the response is for.

Server notifications are return responses without a message id or the id is nil.

#### :debug

```
(:debug <thread id> <frame id> <condition> <restarts> <frames> <cont list>)
```

- reason
    - List of strings, where each string is a line of output
    - Final entry is nil
- cont list
    - List of pending continuations (i.e. message ids)

#### :debug-activate
