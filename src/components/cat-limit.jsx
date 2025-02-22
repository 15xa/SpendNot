export const addOrUpdateLimit = async (limit) => {
    const token = localStorage.getItem("token"); 
    const response = await fetch(flink + "set-category-limit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
        userId,
        category: "Food",
        limit: limit,
      }),
    });
  
    const data = await response.json();
    console.log(data);
  };
  
  addOrUpdateLimit();
  