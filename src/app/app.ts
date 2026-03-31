import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TinyUrlService, TinyUrl, TinyUrlAddDto } from './services/tinyurl.service';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('TinyURL Clone');

  publicUrls: Observable<TinyUrl[]> | undefined;
  searchTerm = new BehaviorSubject<string>('');
  generatedUrl: string | null = null;

  newUrl: TinyUrlAddDto = {
    originalURL: '',
    isPrivate: false,
  };

  constructor(
    private tinyurlService: TinyUrlService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadUrls();
  }

  loadUrls() {
    const data$ = this.tinyurlService.getPublicUrls();
    this.publicUrls = combineLatest([data$, this.searchTerm]).pipe(
      map(([urls, search]) => {
        if (!search) return urls;
        const lowerSearch = search.toLowerCase();
        return urls.filter(u => 
          u.originalURL?.toLowerCase().includes(lowerSearch) || 
          u.shortURL?.toLowerCase().includes(lowerSearch)
        );
      })
    );
  }

  shortenUrl() {
    const url = this.newUrl.originalURL?.trim() || '';
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      this.toastr.warning('Please enter a valid URL (must start with http:// or https://)', 'Validation Error');
      return;
    }
    this.tinyurlService.addUrl(this.newUrl).subscribe({
      next: (response: any) => {
        this.toastr.success('URL shortened successfully!', 'Success');
        this.generatedUrl = response?.shortURL || null;
        this.newUrl.originalURL = '';
        this.newUrl.isPrivate = false;
        this.loadUrls();
      },
      error: (err) => {
        this.toastr.error('Failed to shorten URL. Please try again.', 'Server Error');
        console.error('Error shortening URL:', err);
      },
    });
  }

  deleteUrl(code: string) {
    if (confirm('Are you sure you want to delete this URL?')) {
      this.tinyurlService.deleteUrl(code).subscribe({
        next: () => {
          this.toastr.success('URL deleted successfully!', 'Success');
          this.loadUrls();
        },
        error: (err) => console.error('Error deleting URL:', err),
      });
    }
  }

  copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(
      () => {
        this.toastr.info('URL copied to clipboard!', 'Copied');
      },
      (err) => {
        this.toastr.error('Failed to copy text', 'Error');
        console.error('Could not copy text: ', err);
      }
    );
  }
}
