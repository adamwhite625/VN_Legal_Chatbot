from app.core.config import client, embeddings, settings

def retriever_node(state):
    """
    Node 2: Retrieval Agent - Có lọc điểm số (Score Threshold)
    """
    query = state.get("standalone_query", state["query"])
    limit = state.get("search_limit", 3)
    
    if limit == 0:
        return {"retrieved_docs": []}

    print(f"🧠 [RETRIEVER]: Đang tìm {limit} văn bản cho: {query}")
    
    try:
        vector = embeddings.embed_query(query)
        
        # 1. Tìm kiếm trong Qdrant
        # Lưu ý: score_threshold=0.5 nghĩa là chỉ lấy kết quả giống trên 50%
        try:
            results = client.search(
                collection_name=settings.COLLECTION_NAME,
                query_vector=vector, 
                limit=limit,
                score_threshold=0.35  # <--- THÊM DÒNG NÀY (Thử 0.35 - 0.5 tùy dữ liệu)
            )
        except AttributeError:
            # Fallback cho bản cũ
            results = client.query_points(
                collection_name=settings.COLLECTION_NAME,
                query=vector, 
                limit=limit,
                score_threshold=0.35 
            ).points
            
        docs = []
        for r in results:
            payload = r.payload or {}
            
            # --- SỬA LOGIC LẤY NGUỒN ---
            so_hieu = payload.get("so_hieu") or payload.get("law_id") or payload.get("article_id") or ""
            ten_luat = payload.get("loai_van_ban") or payload.get("law_name") or ""
            
            if so_hieu and ten_luat:
                source_name = f"{so_hieu} - {ten_luat}"
            elif so_hieu:
                source_name = so_hieu
            else:
                source_name = payload.get("source") or "Văn bản pháp luật"
            
            source_name = str(source_name).strip()
            
            # --- DEBUG MỚI: In ra Source Name để biết nó tìm thấy Điều mấy ---
            print(f"   -> Tìm thấy: {source_name} (Score: {r.score:.4f})")

            content = (
                payload.get('combine_Article_Content') or 
                payload.get('page_content') or 
                payload.get('content') or 
                payload.get('law_content') or 
                ""
            )

            docs.append({
                "source": source_name,
                "content": content
            })
            
        if not docs:
            print("   -> ⚠️ Không tìm thấy văn bản nào đủ độ khớp (Low Score).")

        return {"retrieved_docs": docs}
        
    except Exception as e:
        print(f"⚠️ Lỗi Retriever: {e}")
        return {"retrieved_docs": []}