# Hello! This is a Domy File!

# variable-declaration
my stat = true;

# function-declaration
my f1 = do(arg1, arg2) {
    # variable-assignment
    # ternary-operation
    stat = (stat)
        # test
        ? arg1 == stat
        # and, unary-operation, or
        : arg2 & !stat | stat;
    # return, ternary-operation
    return (stat) ? arg1 : arg2;
};

# function-declaration
my f2 = do(arg1, arg2, arg3) {
    # return, function-invocation
    return arg1(arg2, arg3);
};

# function-declaration, return
my f3 = do() { return };

# variable-declaration
my best = false;

# unary-operation
!best
# and, while, variable-assignment, unary-operation, function-invocation
& while(best = !f2(f1, stat, best)) {
    # and, break
    stat & break;
    # and, continue
    best & continue;
}
# and, ternary-operation
& (best)
    ? {
        # variable-assignment
        best = !best;
        # function-invocation
        print(best);
    }
    # function invocation, xor
    : print(best ^ stat)
# or, parenthesis, variable-declaration, function-declaration,
| (my f4 = do(a, b, c) {
    # return, parenthesis, xor, and
    return (a ^ c) & b;
});

# block
{
    # variable-declaration, xor, function-invocation
    my arbi_trary-Block = best ^ f2(
        # and
        true & false,
        false,
        best
    );
    # variable-assignment
    my f5 = arbi_trary-Block;
    # variable-assignment
    arbi_trary-Block = f3;
}

# Bye!, thanks for coming by(e)!
