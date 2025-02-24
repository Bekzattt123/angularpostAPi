import { Component, OnInit } from '@angular/core';
import { PostService, Post } from '../../services/post.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-post-list',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  newPost: Post = { title: '', body: '' };
  searchQuery: string = ''; // For search functionality
  editingPost: Post | null = null; // Tracks the post being edited
  editingTitleProxy: string = ''; // Proxy for editingPost.title
  editingBodyProxy: string = ''; // Proxy for editingPost.body

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data.map(post => ({
        ...post,
        title: post.title || 'No Title', // Provide default value
        body: post.body || 'No Content' // Provide default value
      }));
    });
  }

  addPost(): void {
    if (this.newPost.title.trim() && this.newPost.body.trim()) {
      this.postService.createPost(this.newPost).subscribe((post) => {
        this.posts.push(post);
        this.newPost = { title: '', body: '' }; // Reset form
      });
    } else {
      alert('Заполните заголовок и текст!');
    }
  }

  editPost(post: Post): void {
    this.editingPost = { ...post }; // Create a copy of the post for editing
    this.editingTitleProxy = post.title || ''; // Initialize proxy variables
    this.editingBodyProxy = post.body || '';
  }

  updatePost(): void {
    if (this.editingPost) {
      // Синхронизируем proxy-переменные с editingPost
      this.editingPost.title = this.editingTitleProxy;
      this.editingPost.body = this.editingBodyProxy;

      // Проверяем, что поля title и body не пустые
      if (this.editingPost.title.trim() && this.editingPost.body.trim()) {
        this.postService.updatePost(this.editingPost).subscribe(() => {
          // Находим индекс обновляемого поста в массиве posts
          const index = this.posts.findIndex((p) => p.id === this.editingPost?.id);
          if (index !== -1) {
            // Обновляем пост в массиве
            this.posts[index] = {body: '', title: '', ...this.editingPost };
          }
          // Сбрасываем состояние редактирования
          this.editingPost = null;
        });
      } else {
        alert('Заполните заголовок и текст!');
      }
    }
  }

  deletePost(id: number): void {
    this.postService.deletePost(id).subscribe(() => {
      this.posts = this.posts.filter((post) => post.id !== id);
    });
  }

  // Getter for filtered posts (search functionality)
  get filteredPosts(): Post[] {
    if (!this.searchQuery) {
      return this.posts; // Return all posts if search query is empty
    }
    const query = this.searchQuery.toLowerCase();
    return this.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) || post.body.toLowerCase().includes(query)
    );
  }
}
