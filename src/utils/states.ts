

export const getBadgeColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'yellow';
    case 'open':
      return 'red';
    case 'closed':
      return 'zinc';
    case 'pending':
      return 'blue';
    case 'resolved':
      return 'green';
    case 'archived':
      return 'zinc';
    default:
      return 'zinc';
  }
}