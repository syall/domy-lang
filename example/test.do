my stat = true;
print(stat);
stat = stat
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
stat = while stat = !stat {
    !stat & continue;
    stat & break;
}
print(stat);
stat = do(arg1, arg2) {
    return arg1 & arg2;
}
stat(true, true);
print(stat);
