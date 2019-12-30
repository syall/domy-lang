my stat = false;
print(stat);
stat = stat;
print(stat);
stat = (stat);
print(stat);
stat = do(arg1, arg2) {}
stat(true, true);
print(stat);
stat = !stat;
print(stat);
stat = stat ^ false;
print(stat);
stat = stat & true;
print(stat);
stat = stat | false;
print(stat);
stat = (stat) ? true : false;
print(stat);
stat = !stat;
print(stat);
stat = stat;
print(stat);
stat = stat == true;
print(stat);
stat = stat != false;
print(stat);
stat = false;
print(stat);
stat = (stat & true) | false;
print(stat);
stat = do(arg1, arg2) {
    return arg1 & arg2;
}
print(stat);
print(stat(true, true));
stat = false;
my fn = while stat = !stat {
    print(stat);
    stat & continue;
    !stat & break;
}
