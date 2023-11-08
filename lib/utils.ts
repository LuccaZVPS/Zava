export const queryParser = (query: string): any => {
  const queryFormated: object = {};
  if (query.includes("&")) {
    const queryList = query.split("&");
    queryList.forEach((q) => {
      const querySplited = q.split("=");
      queryFormated[querySplited[0]] = querySplited[1];
      return;
    });
  }
  const querySplited = query.split("=");
  queryFormated[querySplited[0]] = querySplited[1];
  return queryFormated;
};

export const compareArray = (a1: any[], a2: any[]) => {
  let isEqual = true;
  if (a1.length !== a2.length) {
    isEqual = false;
    return isEqual;
  }
  for (let index = 0; index < a1.length; index++) {
    if (a1[index] !== a2[index]) {
      isEqual = false;
      break;
    }
  }
  return isEqual;
};

export const removeCharacters = (input: string, ...toRemove: string[]) => {
  for (const str of toRemove) {
    for (const char of str) {
      input = input.split(char).join("");
    }
  }
  return input;
};
