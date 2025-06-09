import psycopg2

class PsychologicalTestTool:
    def __init__(self, db_params, test_id):
        """
        db_params: Parámetros de conexión a la base de datos PostgreSQL.
        test_id: ID del test a realizar.
        """
        self.db_params = db_params
        self.test_id = test_id
        self.current_question_index = 0
        self.answers = []
        self.questions = []
        self.load_questions()

    def load_questions(self):
        """
        Carga las preguntas y opciones desde la base de datos utilizando una consulta SQL.
        """
        print(f"Conectando a la base de datos para cargar las preguntas del test {self.test_id}...")
        
        conn = psycopg2.connect(**self.db_params)
        cursor = conn.cursor()

        # Consulta SQL para obtener preguntas y opciones
        query = """
        SELECT 
            t.id AS test_id,
            t.nombre AS test_nombre,
            t.descripcion AS test_descripcion,
            pt.id AS pregunta_id,
            pt.texto AS pregunta_texto,
            pt.tipo AS pregunta_tipo,
            op.id AS opcion_id,
            op.texto_opcion AS opcion_texto,
            op.valor AS opcion_valor,
            op.orden AS opcion_orden
        FROM 
            public.tests t
        JOIN 
            public.preguntas_test pt ON pt.test_id = t.id
        JOIN 
            public.opciones_pregunta_test op ON op.pregunta_id = pt.id
        WHERE 
            t.id = %s
        ORDER BY 
            pt.id, op.orden
        """
        
        cursor.execute(query, (self.test_id,))
        rows = cursor.fetchall()

        print(f"Se han cargado {len(rows)} filas de preguntas y opciones.")

        # Organizar las preguntas y opciones en un formato adecuado
        current_question = None
        for row in rows:
            question_data = {
                "test_id": row[0],
                "test_nombre": row[1],
                "test_descripcion": row[2],
                "pregunta_id": row[3],
                "pregunta_texto": row[4],
                "pregunta_tipo": row[5],
                "opciones": []
            }

            # Solo añadir preguntas únicas para evitar repeticiones
            if current_question is None or current_question["pregunta_id"] != row[3]:
                if current_question:
                    self.questions.append(current_question)
                current_question = question_data
                current_question["opciones"] = []

            current_question["opciones"].append({
                "opcion_id": row[6],
                "opcion_texto": row[7],
                "opcion_valor": row[8],
                "opcion_orden": row[9]
            })

        # Asegurarse de agregar la última pregunta
        if current_question:
            self.questions.append(current_question)

        conn.close()

        # Imprimir las preguntas y opciones cargadas
        print("Las preguntas y opciones cargadas son:")
        for question in self.questions:
            print(f"Pregunta: {question['pregunta_texto']}")
            print("Opciones:")
            for option in question["opciones"]:
                print(f"  - {option['opcion_texto']} (Valor: {option['opcion_valor']})")

    def get_next_question(self):
        """
        Devuelve la siguiente pregunta y sus opciones, si existen.
        """
        if self.current_question_index < len(self.questions):
            question = self.questions[self.current_question_index]
            self.current_question_index += 1
            return question
        else:
            return None

    def save_answer(self, answer):
        """
        Guarda la respuesta del usuario.
        """
        self.answers.append(answer)

    def has_more_questions(self):
        """
        Verifica si hay más preguntas.
        """
        return self.current_question_index < len(self.questions)


# Parámetros de conexión a la base de datos
db_params = {
    "dbname": "app",
    "user": "postgres",
    "password": "1234",
    "host": "localhost",
    "port": 5432
}


#test_tool = PsychologicalTestTool(db_params, test_id="LSAS-test")


#test_tool.load_questions()
