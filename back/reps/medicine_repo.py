def get_references(conn):
    # Получаем справочники
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM pharmacy.manufacturers ORDER BY name")
    manufacturers = cur.fetchall()
    cur.execute("SELECT id, name FROM pharmacy.active_substances ORDER BY name")
    substances = cur.fetchall()
    cur.execute("SELECT id, name FROM pharmacy.indications ORDER BY name")
    indications = cur.fetchall()
    return {"manufacturers": manufacturers, "substances": substances, "indications": indications}

def get_all_medicines(conn, name=None, country=None, prescription=None):
    # Собираем запрос
    query = """
        SELECT m.id, m.name, m.country, m.release_form, m.prescription_required,
               m.shelf_life_months, mf.name as manufacturer,
               array_agg(DISTINCT s.name) as substances,
               array_agg(DISTINCT i.name) as indications
        FROM pharmacy.medicines m
        LEFT JOIN pharmacy.manufacturers mf ON m.manufacturer_id = mf.id
        LEFT JOIN pharmacy.medicine_substance ms ON m.id = ms.medicine_id
        LEFT JOIN pharmacy.active_substances s ON ms.substance_id = s.id
        LEFT JOIN pharmacy.medicine_indication mi ON m.id = mi.medicine_id
        LEFT JOIN pharmacy.indications i ON mi.indication_id = i.id
    """
    conditions = []
    params = []
    
    if name:
        conditions.append("m.name ILIKE %s")
        params.append(f"%{name}%")
    if country:
        conditions.append("m.country ILIKE %s")
        params.append(f"%{country}%")
    if prescription is not None:
        conditions.append("m.prescription_required = %s")
        params.append(prescription)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " GROUP BY m.id, mf.name ORDER BY m.name"
    
    cur = conn.cursor()
    cur.execute(query, params)
    return cur.fetchall()

def get_medicine_by_id(conn, med_id):
    # Одно лекарство
    query = """
        SELECT m.id, m.name, m.country, m.release_form, m.prescription_required,
               m.shelf_life_months, m.contraindications, mf.name as manufacturer,
               array_agg(DISTINCT s.name) as substances,
               array_agg(DISTINCT i.name) as indications
        FROM pharmacy.medicines m
        LEFT JOIN pharmacy.manufacturers mf ON m.manufacturer_id = mf.id
        LEFT JOIN pharmacy.medicine_substance ms ON m.id = ms.medicine_id
        LEFT JOIN pharmacy.active_substances s ON ms.substance_id = s.id
        LEFT JOIN pharmacy.medicine_indication mi ON m.id = mi.medicine_id
        LEFT JOIN pharmacy.indications i ON mi.indication_id = i.id
        WHERE m.id = %s
        GROUP BY m.id, mf.name
    """
    cur = conn.cursor()
    cur.execute(query, (med_id,))
    return cur.fetchone()

def create_medicine(conn, data):
    # Вставляем лекарство
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO pharmacy.medicines (name, country, release_form, prescription_required, shelf_life_months, manufacturer_id)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
    """, (data["name"], data["country"], data["release_form"], data["prescription_required"], data["shelf_life_months"], data["manufacturer_id"]))
    med_id = cur.fetchone()["id"]
    for sid in data["substance_ids"]:
        # Привязываем вещества
        cur.execute("INSERT INTO pharmacy.medicine_substance (medicine_id, substance_id) VALUES (%s, %s)", (med_id, sid))
    for iid in data["indication_ids"]:
        # Привязываем показания
        cur.execute("INSERT INTO pharmacy.medicine_indication (medicine_id, indication_id) VALUES (%s, %s)", (med_id, iid))
    conn.commit()

def delete_medicine(conn, med_id):
    # Удаляем запись
    cur = conn.cursor()
    cur.execute("DELETE FROM pharmacy.medicines WHERE id = %s", (med_id,))
    conn.commit()

def get_medicine_for_edit(conn, med_id):
    # Получаем данные лекарства + ID связей для формы
    cur = conn.cursor()
    cur.execute("""
        SELECT m.id, m.name, m.country, m.release_form, m.prescription_required,
               m.shelf_life_months, m.contraindications, m.manufacturer_id,
               array_agg(DISTINCT ms.substance_id) as substance_ids,
               array_agg(DISTINCT mi.indication_id) as indication_ids
        FROM pharmacy.medicines m
        LEFT JOIN pharmacy.medicine_substance ms ON m.id = ms.medicine_id
        LEFT JOIN pharmacy.medicine_indication mi ON m.id = mi.medicine_id
        WHERE m.id = %s
        GROUP BY m.id
    """, (med_id,))
    return cur.fetchone()

def update_medicine(conn, med_id, data):
    # Обновляем запись и связи
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE pharmacy.medicines 
            SET name=%s, country=%s, release_form=%s, prescription_required=%s, 
                shelf_life_months=%s, manufacturer_id=%s, contraindications=%s
            WHERE id=%s
        """, (data["name"], data["country"], data["release_form"], data["prescription_required"], 
              data["shelf_life_months"], data["manufacturer_id"], data.get("contraindications", ""), med_id))
        
        # Очищаем старые связи
        cur.execute("DELETE FROM pharmacy.medicine_substance WHERE medicine_id = %s", (med_id,))
        cur.execute("DELETE FROM pharmacy.medicine_indication WHERE medicine_id = %s", (med_id,))
        
        # Вставляем новые
        for sid in data["substance_ids"]:
            cur.execute("INSERT INTO pharmacy.medicine_substance (medicine_id, substance_id) VALUES (%s, %s)", (med_id, sid))
        for iid in data["indication_ids"]:
            cur.execute("INSERT INTO pharmacy.medicine_indication (medicine_id, indication_id) VALUES (%s, %s)", (med_id, iid))
            
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        raise