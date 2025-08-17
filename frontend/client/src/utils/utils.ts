export const isNextSameAuthor = (data: any, item: any, id: number) => {
  if (data[id + 1] && data[id + 1].author === item.author) {
    return (
      id < data.length - 1 &&
      data[id + 1].character.name === item.character.name
    );
  }
  return false;
};
export const isSameAuthor = (data: any, item: any, id: number) => {
  if (id > 0 && data[id - 1].author === item.author) {
    return data[id - 1].character.name === item.character.name;
  }
  return false;
};

export const getCurrentTime = () => {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
