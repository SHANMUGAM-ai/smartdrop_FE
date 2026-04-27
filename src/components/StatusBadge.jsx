export default function StatusBadge({ status, payStatus }) {
  if (payStatus) {
    const map = {
      Paid: { cls: 'badge bg-b', label: '✅ Paid' },
      Pending: { cls: 'badge by', label: '⏳ Pending' },
      Completed: { cls: 'badge bg-b', label: '✅ Completed' },
      Failed: { cls: 'badge br-b', label: '❌ Failed' },
      COD: { cls: 'badge bgray', label: '💵 COD' },
    };
    const { cls, label } = map[payStatus] || { cls: 'badge bgray', label: payStatus };
    return <span className={cls}>{label}</span>;
  }

  const map = {
    pending:   { cls: 'badge by',   label: '⏳ Pending' },
    accepted:  { cls: 'badge bb',   label: '✅ Accepted' },
    picked_up: { cls: 'badge bp',   label: '📦 Picked Up' },
    out_for_delivery: { cls: 'badge bo', label: '🛵 Out for Delivery' },
    delivered: { cls: 'badge bg-b', label: '✅ Delivered' },
    cancelled: { cls: 'badge br-b', label: '❌ Cancelled' },
  };
  const { cls, label } = map[status] || { cls: 'badge bgray', label: status };
  return <span className={cls}>{label}</span>;
}

