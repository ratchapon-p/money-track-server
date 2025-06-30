

export const searchAndFilterQuery = ({ limit, offSet, tz, filterData, searchText }) => {
  let query = '';
  const params = [];

  // ===== 1. Apply searchText =====
  for (const key in searchText) {
    const field = searchText[key];
    const value = field;
    const type = field?.type || 'input'; // default เป็น input
    
    if (!value) continue;

    if (type === 'input') {
      query += ` AND ${key} LIKE ?`;
      params.push(`%${value}%`);

      // ถ้า filterData มี key นี้ ตรวจสอบว่า filter แบบไหน
      
      const condition = filterData[key];
      if(condition){
          if (condition === 'equal') {
            query += ` AND ${key} = ?`;
          } 
          else if (condition === 'grether') {
            query += ` AND ${key} > ?`;
          } 
          else if (condition === 'less') {
            query += ` AND ${key} < ?`;
          } 
          else if (condition === 'not_equal') {
            query += ` AND ${key} != ?`;
          } 
        //   else {
        //     query += ` AND ${key} = ?`; // fallback
        //   }
          params.push(value);
      }
    }
  }

  const orderBys = [];
  for (const key in searchText) {
    const order = searchText[key]?.orderByType;
    if (order === 'asc' || order === 'desc') {
      orderBys.push(`${key} ${order.toUpperCase()}`);
    }
  }

  if (orderBys.length > 0) {
    query += ` ORDER BY ${orderBys.join(', ')}`;
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(limit);
  params.push(offSet);

  return { query, params };
};

