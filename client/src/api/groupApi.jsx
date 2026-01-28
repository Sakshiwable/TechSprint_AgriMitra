import axios from "axios";

const API_URL = "http://localhost:4000/api/groups";

// 🧭 Create a new group
export const createGroup = async (token, groupName, destination) => {
  const res = await axios.post(
    `${API_URL}/create`,
    { groupName, destination },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.group;
};

// 💌 Invite a friend by email
export const inviteFriend = async (token, groupId, friendEmail) => {
  const res = await axios.post(
    `${API_URL}/invite`,
    { groupId, friendEmail },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// ✅ Accept a group invite
export const acceptInvite = async (token, requestId) => {
  const res = await axios.post(
    `${API_URL}/accept`,
    { requestId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// 👥 Get all group members
export const getGroupMembers = async (token, groupId) => {
  const res = await axios.get(`${API_URL}/members/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.members;
};
