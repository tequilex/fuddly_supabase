import { Messages } from './Messages';

export default function MessagesPage() {
  // TODO: когда будет messagesSlice в Redux, загружать сообщения оттуда
  // const dispatch = useAppDispatch();
  // const { messages, loading } = useAppSelector((state) => state.messages);
  //
  // useEffect(() => {
  //   dispatch(fetchMessages());
  // }, [dispatch]);

  return <Messages />;
}
