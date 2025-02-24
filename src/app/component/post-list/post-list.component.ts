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
  editingPost: Post | null = null;

  // Intermediate variables for editingPost.title and editingPost.body
  editingTitleProxy: string = '';
  editingBodyProxy: string = '';

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
        this.newPost = { title: '', body: '' };
      });
    }
  }

  editPost(post: Post): void {
    this.editingPost = { ...post }; // Create a copy of the post for editing
    this.editingTitleProxy = post.title || ''; // Initialize proxy variables
    this.editingBodyProxy = post.body || '';
  }

  updatePost(): void {
    if (this.editingPost) {
      this.editingPost.title = this.editingTitleProxy; // Sync proxy with editingPost
      this.editingPost.body = this.editingBodyProxy;

      if (this.editingPost.title.trim() && this.editingPost.body.trim()) {
        this.postService.updatePost(this.editingPost).subscribe(() => {
          const index = this.posts.findIndex((p) => p.id === this.editingPost?.id);
          if (index !== -1) {
            this.posts[index] = this.editingPost!;
          }
          this.editingPost = null; // Reset editingPost after saving
        });
      }
    }
  }

  deletePost(id: number): void {
    this.postService.deletePost(id).subscribe(() => {
      this.posts = this.posts.filter((post) => post.id !== id);
    });
  }
}
