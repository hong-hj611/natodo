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
      alert('카메라권한 설정이 필요합니다');
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
      alert('갤러리권한 설정이 필요합니다');
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
      photos : photo, 
      //키와 키값의 이름이 동일할 때는 하나의 이름으로 써도 된다
    }
    setTodos([newTodo, ...todos]);
    setText('');
    setPhoto(null);
  }
	// 삭제 버튼 구현
  const removeTodo = (id)=>{
      setTodos( todos.filter( (item) => item.id !== id) )
  }
  // 날짜 변경시 이벤트 함수
  const changeDate = (e, chdate ) =>{
    if (Platform.OS === 'android' ){
      setShowPicker(false);
    }
    if (chdate) {
      setDate(chdate);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 할일</Text>
      <View style={styles.inputBox}>

        {/* 할일 입력상자 */}
        <TextInput style={styles.in} placeholder='할일 입력'
          value={text}
          onChangeText={setText}
        />

        {/* 날짜 버튼 만들기*/}
        <Pressable onPress={ () => setShowPicker(true)}> 
          <Text>{formatDate(date)}</Text>
        </Pressable>

        {/* 사진 관련 버튼들 */}
        <View>
          <Pressable onPress={getPhoto}>
            <Text>사진찍기</Text>
          </Pressable>
          <Pressable onPress={getGallery}>
            <Text>갤러리</Text>
          </Pressable>
        </View>

        <View style={{width:150, height:100}}>
          { // photo가 있으면 () 실행 photo && (실행문)  == photo ? (참-있으면) : (거짓-없으면) 동일하다
            photo && (
              <Image source={{uri : photo}} style={{width:'100%', height:'100%'}} />
              // React Native의 <Image>는 문자열 단독으로 사용하면 절대 표시되지 않는다. 중괄호 형식-객체형태로 {{uri: photo}}
            )
          }
        </View>

        {/* 추가버튼 만들기 */}
        <Pressable  style={styles.addbtn} onPress={addTodo}>
          <Text style={styles.addtext}>추가</Text>
        </Pressable>
      </View>
			
			{ 
        //  showpicker가 참(true)값이면 데이트피커를 호출해서 보여주기
          showPicker && (
            <DateTimePicker 
                value={date} 
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={changeDate}
            />

          )
      }

      {/* 할일 목록 리스트  */}
      <FlatList 
        data = {todos}
        keyExtractor={ (item) => item.id }
        ListEmptyComponent={
          <Text>할일이 없어요</Text>
        }
        style={{width:150, height:100, margin: 10}}
        renderItem={({item, index}) => (
          <Pressable onLongPress={ () => removeTodo(item.id)}  >
            <View style={{width:150, height:100, margin: 10}}>
              <Image source={{uri: item.photos}} style={{width:'100%', height:'100%'}}/>
              {/* React Native의 <Image>는 문자열 단독으로 사용하면 절대 표시되지 않는다. 중괄호 형식-객체형태로 {{uri: item.photos}}*/}
            </View>
            <Text>{index + 1}</Text>
            <Text>{item.title}</Text>
            <Text>{item.date}</Text>
            <Text> 길게 눌러서 삭제</Text>
          </Pressable>
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop : 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c8d8bdff',
  },
  title : {
    fontSize : 30,
    margin : 30,
  },
  inputBox : {
    flexWrap : 'wrap',
    flexDirection : 'row',
    margin : 20,
  },
  in : {
    width : 200,
    height : 40,
    backgroundColor:'#fff',
    padding : 10,
    borderRadius : 10,
    marginRight : 10,
  },
  addbtn : {
    width : '100%',
    height : 40,
    backgroundColor : "#1cc942ff",
    color : '#aaa',
    justifyContent : 'center',
    alignItems : 'center',
    borderRadius : 7,
    marginTop : 10
  },
  addtext : {
    fontSize : 20,
    color : 'white',
  }
});
