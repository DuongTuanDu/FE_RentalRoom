import { useGetRoomsQuery } from "@/services/room/room.service";

const RoomManageLandlord = () => {
  const { data } = useGetRoomsQuery({ page: 1, limit: 10 });
  console.log("data", data);

  return <div>RoomManageLandlord</div>;
};
export default RoomManageLandlord;
