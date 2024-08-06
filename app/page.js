"use client";
import "core-js/features/promise";
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  getDocs,
  query,
} from "firebase/firestore";
import {
  Box,
  Modal,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { firestore } from "@/firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(true);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const normalizeItemName = (name) => {
    const normalized = name.toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const formatItemName = (name) => {
    const words = name.split(" ");
    if (words.length === 2) {
      return words.join("\n"); // Two words on separate lines
    }
    if (name.length > 7) {
      return `${name.slice(0, 7)}...`; // Truncate single word items longer than 7 characters
    }
    return name;
  };

  const updateInventory = async () => {
    const snapsnot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapsnot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (itemName) => {
    if (itemName.trim() === "") return;

    const normalizedItemName = normalizeItemName(itemName);
    const docRef = doc(collection(firestore, "inventory"), normalizedItemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (itemName) => {
    const normalizedItemName = normalizeItemName(itemName);
    const docRef = doc(collection(firestore, "inventory"), normalizedItemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredResults = inventory.filter(({ name }) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearched(true);
      if (filteredResults.length > 0) {
        setSearchResults(filteredResults);
      } else {
        setSearchResults([{ name: "Item not found" }]);
      }
    } else {
      setSearched(false);
      setSearchResults([]);
    }
  }, [searchTerm, inventory]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(itemName);
      setItemName("");
      handleClose();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="row"
      bgcolor="#031525"
    >
      {/* Inventory List Box Left Most Section */}
      <Box
        width="250px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor="#0D2136"
        padding={2}
        position="relative"
        height="100vh"
      >
        <Typography variant="h6" color="#fff" textAlign="center" gutterBottom>
          Inventory List
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            borderRadius: 4,
            marginBottom: 2,
            width: "100%",
            backgroundColor: "#fff",
            // Search Bar Box
          }}
        />
        {/* Search Results Box */}
        <Box
          width="100%"
          bgcolor="#0D2136"
          padding={2}
          borderRadius={2}
          marginTop={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {searchResults.length > 0
            ? searchResults.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor={name === "Item not found" ? "#f0f0f0" : "#0D2136"}
                  padding={2}
                  borderRadius={1}
                  marginBottom={2}
                >
                  <Typography
                    variant="h6"
                    color={name === "Item not found" ? "#333" : "#fff"}
                    sx={{ whiteSpace: "pre-wrap" }} // Preserve newline characters
                  >
                    {name === "Item not found"
                      ? name
                      : `${formatItemName(name)} - ${quantity}`}
                  </Typography>
                </Box>
              ))
            : searched && (
                <Typography variant="h6" color="#fff">
                  No items found
                </Typography>
              )}
        </Box>
      </Box>

      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding={3}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              transform: "translate(-50%, -50%)",
              margin: 3,
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction="row" spacing={3}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ marginBottom: 2 }}
        >
          Add New Item
        </Button>
        <Box border="4px solid #333" sx={{ marginTop: 3 }}>
          <Box
            height="100px"
            bgcolor="#162C46"
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ marginBottom: 2 }}
          >
            <Typography variant="h2" color="#fff" textAlign="center">
              Inventory Items
            </Typography>
          </Box>
          <Stack
            height="300px"
            spacing={3}
            overflow="auto"
            sx={{ padding: 0 }} // Remove padding from Stack
          >
            <Box
              bgcolor="#0D2136"
              padding={2}
              borderRadius={1}
              // Ensure the white box spans full width
            >
              {inventory.length > 0 ? (
                inventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    display="flex"
                    alignItems="center"
                    bgcolor="#f0f0f0"
                    paddingX={2}
                    marginBottom={3}
                    borderRadius={1}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      height: "60px", // Set a fixed height for the item display box
                    }}
                  >
                    <Box
                      flex={3}
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="#333"
                        sx={{
                          whiteSpace: "pre-wrap", // Preserve newline characters
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatItemName(name)}
                      </Typography>
                    </Box>
                    <Box
                      flex={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body1" color="#333">
                        Quantity:
                      </Typography>
                    </Box>
                    <Box
                      flex={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body1" color="#333">
                        {quantity}
                      </Typography>
                    </Box>
                    <Box
                      flex={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      gap={1}
                    >
                      <Button
                        variant="contained"
                        onClick={() => addItem(name)}
                        size="small"
                      >
                        Add
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => removeItem(name)}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box
                  width="100%"
                  minHeight="150px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgcolor="#f0f0f0"
                  paddingX={2}
                  marginBottom={3}
                  borderRadius={1}
                >
                  <Typography variant="h6" color="#333">
                    Items not found
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
