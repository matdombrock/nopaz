# 🔥 NOPAZ

> No account, no vault, no worries.
> 
> An account-less, vault-less, cloud-less password manager for humans. 

![screenshot](_doc/screenshot.png)

## 💀 Does not feature
- A password vault
- Account management
- Cloud services
- A back-end server
- A database
- A JavaScript framework
- Dependencies on external software
- Leaks
- *Worries*

NOPAZ deterministically generates "random" passwords based off of your master passphrase and a site id. 

Configurations are stored as bookmarks which can be kept in your browser or a note taking app.

## Query Parameters

### ste
- String
- Site identifier
- `example.com` or `my special site`

### spc
- String
- Special rules for password generation
- `all | legacy | none`

### len
- Number
- Password length

### rev
- Number
- Password revision number

### nts
- String
- URL encoded notes 
- Can contain multiple lines 

### mit
- Number
- Minimum hashing iterations.

### app
- String
- Append a string to the end of the password
- Increases password length

### Example
```
.../?ste=asd&spc=all&len=16&rev=1&nts=&mit=10&app=&alg=sha512
```

### Special Parameters
- `dbg=1` : Debug mode
- `adv=1  ` : Advanced mode UI


## 💡 Inspired by
- [Eblade/paz](https://github.com/eblade/paz)
- [Chriszarate/supergenpass](https://github.com/chriszarate/supergenpass)
