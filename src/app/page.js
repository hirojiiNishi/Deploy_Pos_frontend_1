"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // サーバーとクライアントの不一致を防ぐ
  }

  // 商品検索
  // 商品検索
  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/product/${barcode}`);
      if (res.data.product) {
        setProduct(res.data.product);
      } else {
        setProduct({ name: "商品がマスタ未登録です", price: "" }); // ここを変更
      }
    } catch (error) {
      setProduct({ name: "商品がマスタ未登録です", price: "" }); // ここを変更
    }
  };


  // カートに追加 & 合計金額更新
  const addToCart = async () => {
    if (!product) return;
    try {
      const res = await axios.post("http://127.0.0.1:8000/cart/add", {
        prd_id: product.prd_id,
        code: product.code,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
  
      const updatedCart = Object.values(res.data);
      setCart(updatedCart);
      updateTotal(updatedCart);
  
      // ②③④を空欄にする
      setBarcode("");  // コード入力エリアをクリア
      setProduct(null); // 名称・単価表示エリアをクリア
    } catch (error) {
      console.error("カート更新エラー", error);
    }
  };

  // 合計金額の更新
  const updateTotal = (cart) => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  };

  const purchase = async () => {
    if (cart.length === 0) {
      alert("カートが空です");
      return;
    }
  
    const requestData = {
      emp_cd: "9999999999",
      store_cd: "30",
      pos_no: "90",
      cart: Object.values(cart),
    };
  
    console.log("送信データ:", JSON.stringify(requestData, null, 2));
  
    try {
      const res = await axios.post("http://127.0.0.1:8000/purchase", requestData);
      console.log("購入成功", res.data);
  
      // 合計金額（税込）の計算（仮に税率10%とする）
      const totalWithTax = Math.round(total * 1.1);
  
      // ポップアップ表示
      alert(`購入が完了しました。\n合計金額（税込）: ${totalWithTax}円`);
  
      // ②③④⑥のクリア処理
      setBarcode("");  // コード入力エリアをクリア
      setProduct(null); // 名称・単価表示エリアをクリア
      setCart([]);      // 購入リストをクリア
      setTotal(0);      // 合計金額をリセット
  
    } catch (error) {
      console.error("購入エラー", error);
      if (error.response) {
        console.error("サーバーからのレスポンス:", error.response.data);
        alert("エラー詳細: " + JSON.stringify(error.response.data, null, 2));
      }
      alert("購入処理に失敗しました");
    }
  };
  
  

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>POSアプリ</h1>

      {/* 商品検索 */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="バーコードを入力"
          style={styles.input}
        />
        <button onClick={fetchProduct} style={styles.button}>検索</button>
      </div>

      {/* 検索結果 */}
      {product !== null && (
        <div style={styles.productContainer}>
          <h2>商品情報</h2>
          <p>{product.name} {product.price && `- ${product.price}円`}</p>
          {product.name !== "商品がマスタ未登録です" && (
            <button onClick={addToCart} style={styles.addButton}>カートに追加</button>
          )}
        </div>
      )}

      

      {/* カート */}
      <h2>購入リスト</h2>
      <ul style={styles.cartList}>
        {cart.map((item, index) => (
          <li key={index} style={styles.cartItem}>
            {item.name} - {item.price}円 x {item.quantity}
          </li>
        ))}
      </ul>

      {/* 合計金額 */}
      <h3>合計金額: {total}円</h3>

      {/* 購入ボタン */}
      <button onClick={purchase} style={cart.length === 0 ? styles.disabledButton : styles.purchaseButton} disabled={cart.length === 0}>
        購入する
      </button>
    </div>
  );
}

// **スタイル定義**
const styles = {
  container: {
    width: "400px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
    backgroundColor: "#f9f9f9"
  },
  header: {
    marginBottom: "20px"
  },
  searchContainer: {
    marginBottom: "20px"
  },
  input: {
    padding: "8px",
    width: "70%",
    marginRight: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "8px 12px",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  productContainer: {
    margin: "20px 0",
    padding: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px"
  },
  addButton: {
    padding: "8px 12px",
    borderRadius: "4px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  notFound: {
    color: "red",
    fontWeight: "bold"
  },
  cartList: {
    listStyle: "none",
    padding: 0
  },
  cartItem: {
    padding: "5px 0",
    borderBottom: "1px solid #ddd"
  },
  purchaseButton: {
    padding: "10px 20px",
    borderRadius: "4px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginTop: "10px"
  },
  disabledButton: {
    padding: "10px 20px",
    borderRadius: "4px",
    backgroundColor: "#ccc",
    color: "white",
    border: "none",
    cursor: "not-allowed",
    marginTop: "10px"
  }
};
