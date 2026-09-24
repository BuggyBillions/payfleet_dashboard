import api from "../helpers/api";

/** 
 * example usage in destination comp
 * 
 * useQuery({
 *   queryKey: ["testreq"],
 *   queryFn: getTestService,
 *  })
*/
export const getTestService = async () => {
  const res = await api.get("/test");
  return res.data;
};
