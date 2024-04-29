my one = true;
print(one);
my two = false;
print(two);
my res = one & two;
my dofn = do(arg1, arg2) {
    return arg1 & arg2;
}
my fnres = dofn(one, two);
print(fnres);
print(dofn(one, true));
