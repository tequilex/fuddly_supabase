import { useNavigate } from 'react-router-dom';
import { Messages } from './Messages';

export default function MessagesPage() {
  const navigate = useNavigate();

  // TODO: когда будет messagesSlice в Redux, загружать сообщения оттуда
  // const dispatch = useAppDispatch();
  // const { messages, loading } = useAppSelector((state) => state.messages);
  //
  // useEffect(() => {
  //   dispatch(fetchMessages());
  // }, [dispatch]);

  const handleBack = () => {
    navigate('/');
  };

  const handleContactClick = (userId: string) => {
    // Переход к чату с конкретным пользователем
    console.log('Open chat with user:', userId);
  };

  return (
    <Messages
      onBack={handleBack}
      onContactClick={handleContactClick}
    />
  );
}
