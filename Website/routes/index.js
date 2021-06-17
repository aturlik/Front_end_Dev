<h1>MONGODB - EXERCISE</h1>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

<section class="insert">
    <h3>Insert Data</h3>
    <form action="/insert" method="post">
        <div class="input">
            <label for="title">Title</label>
            <input type="text" id="title" name="title">
        </div>
        <div class="input">
            <label for="content">Content</label>
            <input type="text" id="content" name="content">
        </div>
        <div class="input">
            <label for="author">Author</label>
            <input type="text" id="author" name="author">
        </div>
        <button type="submit">INSERT</button>
    </form>
</section>

<section class="specify">
    <h3>Specify Search</h3>
    <form action="/specify" method="post">
        <div class="dropdown">
            <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown link
            </a>

        <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
        </ul>
    </div>
        <div class="input"></div>    
            <label for="DTA">Data Topic Area</label>
            <input type="text" id="DTA" name="DTA">
        </div>
        <div class="input">
            <label for="SpefString">Specific String</label>
            <input type="text" id="SpefString" name="SpefString">
        </div>
        <button type="submit">INSERT</button>
    </form>
</section>

<section class="get">
    <h3>Get Data</h3>
    <a href="/get-data">LOAD DATA</a>
    <div>
        {{# each items }}
            <article class="item">
                <div>Title: {{ this.Title }}</div>
                <div>URL: {{ this.URL }}</div>
                <div>Provider: {{ this.Provider }}</div>
                <div>Cost: {{ this.Cost }}</div>
                <div>Public/DOD: {{ this.[Public/DOD] }}</div>
                <div>Time Commitment (Hours): {{ this.[Time Commitment (Hours)] }}</div>
                <div>Certificate/Degree Program: {{ this.[Certificate/Degree Program] }}</div>
                <div>Data Topic Area: {{ this.[Data Topic Area] }}</div>
                <div>Programming Language: {{ this.[Programming Language] }}</div>
                <div>Base of Operations: {{ this.[Base of Operations] }}</div>
                <div>Barrier to Entry: {{ this.[Barrier to Entry] }}</div>
                <div>Self Paced vs Instructor Led: {{ this.[Self Paced vs Instructor Led] }}</div>
                <div>Learning type: {{ this.[Learning type] }}</div>
                <div>In person vs Remote: {{ this.[In person vs Remote] }}</div>
                <div>Useful Training?: {{ this.[Useful Training?] }}</div>
                <div>Comment: {{ this.Comment }}</div>
                <div>Topics for Graphing: {{ this.[Topics for Graphing] }}</div>
                <div>ID: {{ this._id }}</div>
                <br>
            </article>
        {{/each}}
    </div>
</section>

<section class="update">
    <h3>Update Data</h3>
    <form action="/update" method="post">
        <div class="input">
            <label for="id">ID</label>
            <input type="text" id="id" name="id">
        </div>
        <div class="input">
            <label for="title">Title</label>
            <input type="text" id="title" name="title">
        </div>
        <div class="input">
            <label for="content">Content</label>
            <input type="text" id="content" name="content">
        </div>
        <div class="input">
            <label for="author">Author</label>
            <input type="text" id="author" name="author">
        </div>
        <button type="submit">UPDATE</button>
    </form>
</section>
</section>

<section class="delete">
    <h3>Delete Data</h3>
    <form action="/delete" method="post">
        <div class="input">
            <label for="id">ID</label>
            <input type="text" id="id" name="id">
        </div>
        <button type="submit">DELETE</button>
    </form>
</section>
