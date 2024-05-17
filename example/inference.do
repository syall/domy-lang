my one = true;
print(one);
my two = false;
print(two);
my dofn = do(arg1, arg2) {
    return arg1 ^ arg2;
}
my fnres = dofn(one, two);
print(fnres);
two = true;
print(dofn(one, two));
two = do(var) {
    return var;
}
print(dofn(one, two));
