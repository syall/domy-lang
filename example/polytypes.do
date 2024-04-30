my identity = do(arg1) {
    return arg1;
}
my var = true;
my fn = do(arg1, arg2) {
    return arg1 ^ arg2;
}
print(identity);
print(identity(var));
print(identity(fn));
print(fn(var, fn));
