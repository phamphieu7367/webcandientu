import "./App.css";

import { SearchOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { Button, Input, Space, Table } from "antd";
import axios from "axios";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3001");

const App = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [scaleState, setScaleState] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataScale, setDataScale] = useState(Number);
  const [formData, setFormData] = useState({
    title: "",
  });
  console.log(dataScale, formData.title);

  useEffect(() => {
    socket.on("receive_scale", (data) => {
      setDataScale(data);
    });
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Thực hiện cuộc gọi API sử dụng Axios
        const response = await axios.get("http://localhost:5000/api/data");
        // Lấy dữ liệu từ phản hồi và cập nhật trạng thái của component
        // setData(response.data);
        setScaleState(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    setIsLoading(false);
  }, [isLoading]);

  const [errors, setErrors] = useState({});
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: "Name",
      dataIndex: "title",
      key: "title",
      width: "30%",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Scale",
      dataIndex: "value",
      key: "value",
      width: "20%",
      ...getColumnSearchProps("value"),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      // key: "createdAt",
      // ...getColumnSearchProps("createdAt"),
      // sorter: (a, b) => a.createdAt.length - b.createdAt.length,
      // sortDirections: ["descend", "ascend"],
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.title) {
      validationErrors.title = "Title is required";
    }
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post("http://localhost:5000/api/data", {
          title: formData.title,
          value: dataScale,
        });
        // console.log(response.data);
        setFormData({
          title: "",
        });
        setIsLoading(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };
  const data1 = [];
  for (let i = 0; i < scaleState.length; i++) {
    data1.push({
      key: i + 1,
      title: scaleState[i].title,
      value: scaleState[i].value,
      createdAt: new Date(scaleState[i].createdAt).toLocaleString(),
    });
  }

  return (
    <>
      <div className="container">
        <h1 className="d-flex justify-content-center text-center mt-4">
          Nhóm Cân Điện tử
        </h1>
        <div className="row mt-4">
          <form
            className=" form-value col-3 d-flex justify-content-center text-center flex-column align-items-center"
            onSubmit={handleSubmit}
          >
            <div className="form-floating w-100 mt-3">
              <input
                type="text"
                value={formData.title}
                name="title"
                className="form-control"
                placeholder="Nhập Tên"
                onChange={handleChange}
              />
              {errors.title && <span>{errors.title}</span>}
              <label htmlFor="Nhập Tên">Nhập Tên</label>
            </div>
            <h1 className="me-3 mt-2">Cân điện tử</h1>
            <h2 className="">{dataScale}g</h2>
            <button
              className="btn btn-success border-0 rounded-3 my-4"
              type="submit"
            >
              Add
            </button>
          </form>
          <div className="col-9">
            <Table columns={columns} dataSource={data1} />
          </div>
        </div>
      </div>
    </>
  );
};
export default App;
