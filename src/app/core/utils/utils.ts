interface Branch<T> {
  when: boolean;
  value: T;
}

export const choose = <T>(branches: Branch<T>[], defaultValue: T): T => {
  const match = branches.find((branch) => branch.when);

  return match ? match.value : defaultValue;
};
