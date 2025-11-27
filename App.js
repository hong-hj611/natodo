import React, {useState} from 'react'
import { StyleSheet, Text, View, TextInput, Platform, Image, FlatList, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
//npx expo install expo-image-picker 설치 필요함

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])

  const [date, setDate] = useState( new Date()) // 현재날짜 기초값 
  const [showPicker, setShowPicker] = useState(false) // 피커보여주기
  const [photo, setPhoto] = useState(null) // 사진 보여주기

  // 날짜 형식 만들기
  const formatDate = (d) =>{
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` // 날짜 형식 맞추어서 리턴
  }
  // 카메라로 사진을 찍기
  const getPhoto = async () => {
    //카메라로 사진찍은걸 가져온다. 그중에 상태 status만 가져온다
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    // 'granted' 권한이 있는지 확인
    if (status !== 'granted') { 
      alert('카메라 권한이 필요합니다');
      return;
    }
    // 편집화면 사용/ 퀄리티 설정
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })
    // result.canceled 기본값 false로 취소면 나가라
    if (result.canceled) return
    // 결과가 있으므로 uri를 setPhoto에 넣어라
    const uri = result.assets[0].uri;
    setPhoto(uri);
  }
  // 갤러리에서 사진 선택하기
  const getGallery = async () => {
    // 미디어보관함에서 사진을 가져오기 위해
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { 
      alert('갤러리 권한이 필요합니다');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    })
    // result.canceled 기본값 false로 취소면 나가라
    if (result.canceled) return;
    // 결과가 있으므로 uri를 setPhoto에 넣어라
    const uri = result.assets[0].uri;
    setPhoto(uri)
  }

  // 추가 버튼 구현
  const addTodo = () =>{
    if (!text.trim()) return

    const newTodo = {
      id : Date.now().toString(),
      title : text.trim(),
      date : formatDate(date),
      photo : photo ? { uri: photo } : require('./assets/noimage.jpg')
      // 키와 키값의 이름이 동일할 때는 하나의 이름으로 써도 된다
      // 카메라, 갤러리 사용 안할 경우 noimage 자동 적용되도록
    }
    setTodos([newTodo, ...todos]);
    setText('');
    setPhoto(null);
  }
  // 삭제 버튼 구현
  const removeTodo = (id)=>{
    setTodos(todos.filter(item => item.id !== id))
  }
  // 날짜 변경시 이벤트 함수
  const changeDate = (e, chdate ) =>{
    if (Platform.OS === 'android'){
      setShowPicker(false);
    }
    if (chdate) setDate(chdate);
  }

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>📒 My Todo List</Text>

      {/* 입력 영역 카드 */}
      <View style={styles.inputCard}>
        {/* 할일 입력상자 */}
        <TextInput 
          style={styles.input}
          placeholder='할 일을 입력하세요'
          value={text}
          onChangeText={setText}
        />
        {/* 날짜, 카메라, 갤러리 버튼 */}
        <View style={styles.row}>
          <Pressable style={styles.smallBtn} onPress={ () => setShowPicker(true)}> 
            <Text style={styles.smallBtnText}>{formatDate(date)}</Text>
          </Pressable>

          <Pressable style={styles.smallBtn} onPress={getPhoto}>
            <Text style={styles.smallBtnText}>📷 카메라</Text>
          </Pressable>

          <Pressable style={styles.smallBtn} onPress={getGallery}>
            <Text style={styles.smallBtnText}>🖼 갤러리</Text>
          </Pressable>
        </View>

        {/* 미리보기 이미지 */}
        {/* photo가 있으면 () 실행 photo && (실행문)  == photo ? (참-있으면) : (거짓-없으면) 동일하다 */}
        {photo && (
          <View style={styles.previewBox}>
            <Image source={photo ? { uri: photo } : require('./assets/noimage.jpg')} 
            style={styles.preview} />
            {/* React Native의 <Image>는 문자열 단독으로 사용하면 절대 표시되지 않는다. 중괄호 형식-객체형태로 {{uri: photo}} */}
          </View>
        )}
        {/* 추가버튼 */}
        <Pressable style={styles.addBtn} onPress={addTodo}>
          <Text style={styles.addBtnText}>＋ 추가하기</Text>
        </Pressable>

      </View>

      {/* 날짜 선택 */}
      {/* showpicker가 참(true)값이면 데이트피커를 호출해서 보여주기 */}
      {showPicker && (
        <DateTimePicker 
          value={date} 
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={changeDate}
        />
      )}

      {/* 리스트 */}
      <FlatList 
        data={todos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{marginTop:20}}>할 일이 없습니다 😄</Text>}
        contentContainerStyle={{padding: 10}}
        renderItem={({item, index}) => (
          <Pressable onLongPress={() => removeTodo(item.id)}>
            <View style={styles.todoCard}>
              {/* uri와 require의 목록을 다 적용하도록 */}
              {item.photo && (
                <Image 
                  source={item.photo}
                  // source={{ uri: item.photo }} 
                  style={styles.todoImage}
                />
              )}

              <View style={{flex:1}}>
                <Text style={styles.todoIndex}>#{index + 1}</Text>
                <Text style={styles.todoTitle}>{item.title}</Text>
                <Text style={styles.todoDate}>{item.date}</Text>
                <Text style={styles.todoDelete}>길게 눌러 삭제</Text>
              </View>

            </View>
          </Pressable>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#E9F5E9',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#2A6F2A',
    marginTop: 20,
    marginBottom: 10,
  },

  /* 입력 카드 */
  inputCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
    // 값 클수록 그림자 뚜렷, z-index 높아짐(android)
  },
  input: {
    height: 45,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  smallBtn: {
    backgroundColor: '#3CB371',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  smallBtnText: {
    color: 'white',
    fontWeight: '500',
  },

  /* 사진 미리보기 */
  previewBox: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  addBtn: {
    backgroundColor: '#2E8B57',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },

  /* Todo 카드 */
  todoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
  },
  todoImage: {
    width: 80, 
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'cover',
  },
  todoIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A6F2A',
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2,
  },
  todoDate: {
    color: '#666',
    marginBottom: 4,
  },
  todoDelete: {
    color: '#B22222',
    fontSize: 12,
  },
});