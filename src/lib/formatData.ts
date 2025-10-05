const formatDate = (data: string) => {
  return data.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export { formatDate, capitalize };