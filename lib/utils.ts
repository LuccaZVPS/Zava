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
export const getParams = (route: string, originalRoute: string) => {
  const params: { [key: string]: string } = {};
  if (!originalRoute.includes(":")) {
    return params;
  }
  const regex = new RegExp(
    originalRoute.replace(/:[^/?]+/g, "([^/]+)").replace(/\//g, "\\/") + "$",
    "i"
  );
  const match = route.match(regex);
  if (match) {
    originalRoute.match(/:([^/?]+)/g)?.forEach((param, index) => {
      params[param.slice(1)] = match[index + 1];
    });
  }
  return params;
};
