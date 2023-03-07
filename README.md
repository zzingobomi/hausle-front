<h1 align="center">
  <a href="http://zzingo5.synology.me:17000"><img src="http://zzingo5.synology.me:9000/hausle/logo.png" alt="dungeon" height="250px"></a>
  <br>
  Dungon Adventure
  <br>
</h1>
<br>

<p align="center">
  <img src="http://zzingo5.synology.me:9000/hausle/login.jpg" alt="login" width="300px" />
  <img src="http://zzingo5.synology.me:9000/hausle/ingame.jpg" alt="ingame" width="300px" />
</p>

<br/>

### Frontend

##### React

- React Typescript 를 이용하여 페이지 제작
- Tailwind CSS 를 이용하여 디자인 적용
- GraphQL 을 이용하여 Backend 와 통신
- React-hook-form 을 이용하여 validation 처리
- React-router-dom 을 이용해서 Route 처리

##### ThreeJS

- Three.js 를 이용하여 3D 렌더링 적용
- 캐릭터 조작 및 애니메이션 처리
- Rapier3D 엔진을 이용하여 물리 처리 (etc. gravity, collision)
- 부드러운 움직임을 위해 이동 동기화시 보간 처리

---

### Multiplayer Server

##### Colyseus

- Colyseus 프레임워크를 이용하여 멀티플레이 적용
- Three.js 를 이용하여 Dungeon 월드 상태 계산
- 캐릭터 및 NPC Transform 동기화
- AStar 및 PathFinder 알고리즘을 이용한 NPC 길찾기 적용
- WebSocket 을 이용하여 채팅 기능 구현

---

### Backend

##### NestJS

- NestJS 프레임워크를 이용하여 로그인 서버 구현
- Google, Github OAuth 로그인 구현
- TypeORM 과 PostgreSQL 을 이용한 데이터 저장

---

### Infra

##### Synology Docker

- 개인 Synology NAS docker 를 이용하여 서비스 환경 구축
- Frontend, GameServer, Backend 도커 이미지 빌드 후 컨테이너 생성
- MinIO, PostgreSQL 컨테이너 생성
